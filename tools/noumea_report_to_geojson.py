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
    def __init__(self, points_locations_names, points_names, point_names_aliases):
        self.data = {}
        self.points_locations_names = points_locations_names
        self.points_names = points_names
        self.point_names_aliases = point_names_aliases

    def load(self, pdf_path):
        self.current_file = os.path.basename(pdf_path)

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
            if line in self.points_locations_names:
                num_line = self.parse_location(lines, num_line, line_count)
            else:
                num_line += 1


    def parse_location(self, lines, num_line, line_count):
        location_name = lines[num_line]
        num_line = num_line + 1

        while num_line in range(num_line, line_count):
            point_name = lines[num_line].split(',')[0]
            # If point name is an alias (seems like points names changed across
            # the time) use it's real name instead
            if point_name in self.point_names_aliases:
                point_name = self.point_names_aliases[point_name]

            # Parse other locations recursively
            if lines[num_line] in self.points_locations_names:
                num_line = self.parse_location(lines, num_line, line_count)

            # If the point is unknown, stop the parsing here but generate
            # a warning if it looks like one
            elif point_name not in self.points_names:
                if point_name[0] == 'P' and point_name[1] >= '0' and point_name[1] <= '9':
                    print("[WARNING] Point ignored (missing from YAML) : {}"
                            .format(point_name.encode('utf-8', 'ignore')))
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
        if not existing_data:
            self.data[location_name][point_name].append({
                'date': date_report,
                'source_file': self.current_file,
                'escherichia_coli': self.parse_int(lines[num_line + 2]),
                'intestinal_enterococci': self.parse_int(lines[num_line + 3])
            })

        # Get other data recursively
        return self.parse_and_store_point_data(lines, num_line + 4, line_count,
                                        location_name, point_name)

    def parse_int(self, value):
        return int(value.replace(' ', ''))

    def gen_datetime(self, date_string, time_string):
        datetime_string = '{} {}'.format(date_string, time_string)
        return datetime.strptime(datetime_string, INPUT_DATETIME_FORMAT)


class ParsedDataToGeoJSONConverter:
    def __init__(self, points_config):
        self.geojson = {}
        self.points_config = points_config

    def convert(self, data):
        features = []
        for points_info in self.points_config:
            # Generate area feature
            if 'area' in points_info:
                area_geometry = Polygon([points_info['area']])
                area_props = {'points': points_info['points'].keys()}
                area_feat = Feature(geometry=area_geometry, properties=area_props)
                features.append(area_feat)

            # Generate points features for this area
            for point_name, point_location in points_info['points'].items():
                point_data = self.get_point_data(data, point_name)
                if not point_data:
                    continue
                point = Point(point_location)
                features.append(Feature(geometry=point, properties = {
                    'name': point_name,
                    'data': self.convert_dates_to_strings(
                                self.sort_data_by_date(point_data)
                            )
                }))

        return self.validate(FeatureCollection(features))

    def get_point_data(self, data, requested_point_name):
        for location, points in data.items():
            for point_name, point_data in points.items():
                if point_name == requested_point_name:
                    return point_data
        return None

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
    pdf_paths = sorted([os.path.join(args.pdf_dir, fn) for fn in pdf_filenames])

    # Parse sampling points config
    with open(SAMPLING_POINTS_FILENAME) as sampling_points_file:
        full_config = yaml.safe_load(sampling_points_file)
        points_locations_names = full_config.keys()
        points_config = [val for sublist in full_config.values() for val in sublist]
        points_names = [name for e in points_config for name in e['points'].keys()]
        # Extract points aliases
        point_names_aliases = {}
        for p in points_config:
            if 'points_aliases' not in p:
                continue
            for alias, real_name in p['points_aliases'].items():
                point_names_aliases[alias] = real_name

    # Parse reports
    parser = NoumeaReportParser(points_locations_names, points_names, point_names_aliases)
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
