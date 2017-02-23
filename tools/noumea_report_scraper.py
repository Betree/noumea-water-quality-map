# -*- coding: UTF-8 -*-
# =============================================================================
# title           : noumea_report_scraper.py
# description     : Scrape water quality reports from Noumea's website
#                   Please use with care and don't flood the website !
# author          : Benjamin Piouffle
# date            : 23/02/2017
# python_version  : 2.7
# =============================================================================

import argparse
import os
import urllib2
from datetime import datetime, timedelta, date as date_type

FETCH_DATE_LIMIT = date_type(2015, 01, 01)
BASE_URL = 'http://www.noumea.nc/sites/default/files/'
FILENAME_PATTERN = '{}_-_resultats_surveillance_ebm.pdf'
DATE_FORMAT = '%y%m%d'
ONE_DAY = timedelta(1)

parse_date = lambda (date_str): datetime.strptime(date_str, DATE_FORMAT).date()
format_date = lambda (date): date.strftime(DATE_FORMAT)


class NoumeaReportScraper:
    def __init__(self, pdf_directory):
        self.date_limits = (FETCH_DATE_LIMIT, date_type.today())
        self.pdf_dir = pdf_directory

    def fetch_after(self, date):
        print("Fetch data after {}".format(date))
        date = date + ONE_DAY
        while date <= self.date_limits[1]:
            self.fetch_date(date, False)
            date = date + ONE_DAY

    def fetch_before(self, date):
        print("Fetch data before {}".format(date))
        date = date - ONE_DAY
        while date >= self.date_limits[0]:
            self.fetch_date(date, False)
            date = date - ONE_DAY

    def fetch_date(self, date, verbose=True):
        filename = FILENAME_PATTERN.format(format_date(date))
        out_path = os.path.join(self.pdf_dir, filename)
        file_url = BASE_URL + filename
        if verbose:
            print("Fetch data for {} at {}".format(date, file_url))
        try:
            response = urllib2.urlopen(file_url)
        except urllib2.HTTPError as e:
            if e.code != 404 or verbose:
                print('Cannot retrieve {} : {}'.format(filename, e))
            return False
        with open(out_path, 'wb') as f:
            f.write(response.read())
        print('{} correctly fetched'.format(filename))
        return True

def main():
    parser = argparse.ArgumentParser(description="""Scrape water quality reports
    from Noumea city council website.
    By default, this scrape only reports older than the latest one found in
    pdfs output directory. Use --reverse option to fetch older reports.
    """)
    parser.add_argument('out_dir', help='Path to directory that contains pdfs')
    parser.add_argument('--reverse', action="store_true", help='Fetch history')
    parser.add_argument('--date', help='Fetch only pdf for given date. Format must be yymmdd')
    args = parser.parse_args()

    # Analyse existing pdf files
    pdf_files = [f for f in os.listdir(args.out_dir) if f.endswith('.pdf')]
    dates = [f.split('_')[0] for f in pdf_files]
    invalid_file = next((d for d in dates if len(d) != 6), False)
    if invalid_file:
        print('{} : Bad file name format'.format())
        return False
    if len(dates):
        first_report_date = parse_date(min(dates))
        last_report_date = parse_date(max(dates))
    else:
        first_report_date = last_report_date = date_type.today()

    # Launch scrapp
    scraper = NoumeaReportScraper(args.out_dir)
    if args.date:
        date = parse_date(args.date)
        scraper.fetch_date(date)
    elif args.reverse:
        scraper.fetch_before(first_report_date)
    else:
        scraper.fetch_after(last_report_date)


if __name__ == "__main__":
    main()
