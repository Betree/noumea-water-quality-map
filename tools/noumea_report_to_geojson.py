# -*- coding: UTF-8 -*-
# =============================================================================
# title           : noumea_report_to_geojson.py
# description     : Convert a water quality
#                   report (pdf) as edited by Noumea city to a GeoJSON mapping results with
#                   time information
# author          : Benjamin Piouffle
# date            : 14/01/2017
# python_version  : 2.7
# =============================================================================

import argparse
import yaml
import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime
from subprocess import call
import geojson
from geojson import FeatureCollection, GeometryCollection
from geojson import Feature, Point, Polygon


SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
SAMPLING_POINTS_FILENAME = os.path.join(SCRIPT_DIR, 'sampling_points.yaml')
INPUT_DATETIME_FORMAT = "%d/%m/%Y %H:%M:%S"
OUTPUT_DATETIME_FORMAT = INPUT_DATETIME_FORMAT


class NoumeaReportParser:
    def __init__(self, points_locations, points_names_list):
        self.data = {}
        self.points_locations = points_locations
        self.points_names_list = points_names_list

    def load(self, pdf_path):
        # Export report to XML using pdftohtml
        call(['pdftohtml', '-xml', pdf_path])
        xml_filepath = pdf_path.replace(".pdf", ".xml")

        # Parse report
        tree = ET.parse(xml_filepath)
        root = tree.getroot()
        for page in root:
            self.parse(page)

        # Delete xml file
        os.remove(xml_filepath)

    def parse(self, page):
        lines = [line.text for line in page if line.text and len(line.text.strip())]
        line_count = len(lines)
        num_line = 0
        while num_line in range(0, line_count):
            line = lines[num_line]
            if line in self.points_locations:
                num_line = self.parse_location(lines, num_line, line_count)
            else:
                num_line += 1


    def parse_location(self, lines, num_line, line_count):
        location_name = lines[num_line]
        num_line = num_line + 1

        while num_line in range(num_line, line_count):
            point_name = lines[num_line].split(',')[0]

            # Parse other locations recursively
            if lines[num_line] in self.points_locations:
                num_line = self.parse_location(lines, num_line, line_count)

            # If the point is unknown, stop the parsing here but generate
            # a warning if it looks like one
            elif point_name not in self.points_names_list:
                if point_name[0] == 'P':
                    print("[WARNING] Point ignored (missing from YAML) : {}"
                            .format(point_name))
                num_line += 1

            # Otherwise parse point data
            else:
                num_line = self.parse_and_store_point_data(lines, num_line + 1,
                                line_count, location_name, point_name)
        return num_line


    def parse_and_store_point_data(self, lines, num_line, line_count,
                                   location_name, point_name):
        # If date doesn't look like a date, there's no more data for this point
        if num_line >= line_count or not re.match(r"\d\d/\d\d/\d\d\d\d", lines[num_line]):
            return num_line

        # Get data and store it
        if location_name not in self.data:
            self.data[location_name] = {}
        if point_name not in self.data[location_name]:
            self.data[location_name][point_name] = []

        # Store the data only if we don't already have some for this datetime
        # (usefull if parsing the same file multiple times)
        date_report = self.gen_datetime(lines[num_line], lines[num_line + 1])
        existing_data = next((True for data in
            self.data[location_name][point_name] if data['date'] == date_report
        ), False)
        if existing_data:
            print("[WARNING] Tryin to parse the same data multiple times for {}"
                    .format([location_name, point_name, date_report]))
        else:
            self.data[location_name][point_name].append({
                'date': date_report,
                'escherichia_coli': lines[num_line + 2],
                'intestinal_enterococci': lines[num_line + 3]
            })

        # Get other data recursively
        return self.parse_and_store_point_data(lines, num_line + 4, line_count,
                                        location_name, point_name)

    def gen_datetime(self, date_string, time_string):
        datetime_string = '{} {}'.format(date_string, time_string)
        return datetime.strptime(datetime_string, INPUT_DATETIME_FORMAT)


class ParsedDataToGeoJSONConverter:
    def __init__(self, points_config):
        self.geojson = {}
        self.points_config = points_config

    def convert(self, data):
        features = []

        for location, points in data.items():
            for point_name, point_data in points.items():
                point = Point(self.points_config[point_name]['location'])
                if 'area' in self.points_config[point_name]: # Area is optional
                    area = Polygon([self.points_config[point_name]['area']])
                    geometries = GeometryCollection([point, area])
                else:
                    geometries = point
                point_properties = {
                    'name': point_name,
                    'data': self.convert_dates_to_strings(
                        self.sort_data_by_date(point_data)
                    )
                }
                feat = Feature(geometry=geometries, properties=point_properties)
                features.append(feat)
        return self.validate(FeatureCollection(features))

    def convert_dates_to_strings(self, point_data):
        for d in point_data:
            d['date'] = d['date'].strftime(OUTPUT_DATETIME_FORMAT)
        return point_data

    def sort_data_by_date(self, point_data):
        return sorted(point_data, key=lambda e: e['date'])

    def validate(self, feature_collection):
        validation = geojson.is_valid(feature_collection)
        if validation['valid'] == 'no':
            print('[ERROR] {}'.format(validation['message']))
            return None
        return feature_collection


def merge_dict_list(list):
    return { key: value
        for dic in list
        for key, value in dic.items()
    }


def main():
    parser = argparse.ArgumentParser(description="""Convert water quality
    reports (pdf) as edited by Noumea city to a GeoJSON mapping results with
    time information""")
    parser.add_argument('pdf_dir', help='Path to directory that contains pdfs')
    parser.add_argument('output_file', help='GeoJSON file to generate')
    args = parser.parse_args()

    # Get PDF files paths
    pdf_dir_files = os.listdir(args.pdf_dir)
    pdf_filenames = filter(lambda fn: fn.endswith(".pdf"), pdf_dir_files)
    pdf_paths = [os.path.join(args.pdf_dir, fn) for fn in pdf_filenames]

    # Parse sampling points config
    with open(SAMPLING_POINTS_FILENAME) as sampling_points_file:
        full_config = yaml.safe_load(sampling_points_file)
        points_locations = full_config.keys()
        points_config = merge_dict_list(full_config.values())
        points_names_list = points_config.keys()

    # Parse reports
    parser = NoumeaReportParser(points_locations, points_names_list)
    for pdf_path in pdf_paths:
        print("Parsing report: {}".format(pdf_path))
        parser.load(pdf_path)

    # Generate GeoJSON
    print("Generating GeoJSON...")
    converter = ParsedDataToGeoJSONConverter(points_config)
    converted_data = converter.convert(parser.data)
    if converted_data is not None:
        with open(args.output_file, 'w') as out:
            geojson.dump(converted_data, out, indent=2)

if __name__ == "__main__":
    main()
