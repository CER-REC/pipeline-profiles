import pandas as pd
from util import get_data, idify
import os
import json
import numpy as np
script_dir = os.path.dirname(__file__)

'''
TODO:
    - add get_data from util to other py scripts
    - raise error after id's are applied if a record is longer
      than the max length of id's'
    - create a general purpose function for thisCompanyData creation
      with data, meta, build parameters
'''


def optimizeJson(df):
    del df['Company Name']
    df = df.to_dict(orient="records")
    return df


def process_remediation(sql=False, companies=False, test=False):
    df = get_data(sql=sql,
                  script_dir=script_dir,
                  query="remediation.sql",
                  db="dsql22cap")

    for delete in ['Pipeline Name',
                   'Facility Name',
                   'Facility Type',
                   'NearestPopulatedCentre']:

        del df[delete]

    for stringCol in ['Applicable Land Use',
                      'Site Status']:

        df[stringCol] = [str(x) for x in df[stringCol]]

    # add id's
    landUseId = {"protected area": "pa",
                 "non-developed land": "ndl",
                 "agricultural land": "al",
                 "developed land - residential": "dlr",
                 "developed land - industrial": "dli"}

    statusIds = {"monitored": "m",
                 "post-remediation monitoring": "prm",
                 "facility monitoring": "fm",
                 "ongoing remediation": "or",
                 "site assessment": "sa",
                 "risk managed": "rm"}

    df = idify(df, "Applicable Land Use", landUseId)
    df = idify(df, "Province", "region")
    df = idify(df, "Site Status", statusIds)

    # print(set(list(df['Site Status'])))
    df['Final Submission Date'] = pd.to_datetime(df['Final Submission Date'])
    df['y'] = df['Final Submission Date'].dt.year
    del df['Final Submission Date']

    df = df.fillna(value=np.nan)
    for ns in ['Product Carried',
               'Applicable Land Use',
               'Activity At Time',
               'Contaminants at the Site',
               'Initial Estimate of Contaminated soil m3',
               'Is site within 30 m of waterbody',
               'Site Status',
               'Latitude',
               'Longitude']:

        df[ns] = [None if x in ["Not Specified", np.nan, "nan"] else x for x in df[ns]]

    for numeric in ['Initial Estimate of Contaminated soil m3',
                    'Latitude',
                    'Longitude',
                    'y']:

        df[numeric] = df[numeric].replace(np.nan, int(-1))

    for intNumeric in ['y', 'Initial Estimate of Contaminated soil m3']:
        df[intNumeric] = df[intNumeric].astype(int)

    df['loc'] = [[lat, long] for lat, long in zip(df['Latitude'],
                                                  df['Longitude'])]
    del df['Latitude']
    del df['Longitude']

    df = df.rename(columns={"EventNumber": "id",
                            "Product Carried": "sub",
                            "Site Status": "s",
                            "Activity At Time": "a",
                            "Province": "p",
                            "Applicable Land Use": "use",
                            "Contaminants at the Site": "c",
                            "Initial Estimate of Contaminated soil m3": "vol",
                            "Is site within 30 m of waterbody": "w"})

    if companies:
        company_files = companies
    else:
        company_files = ['NOVA Gas Transmission Ltd.',
                         'TransCanada PipeLines Limited',
                         'Enbridge Pipelines Inc.',
                         'Enbridge Pipelines (NW) Inc.',
                         'Enbridge Bakken Pipeline Company Inc.',
                         'Express Pipeline Ltd.',
                         'Trans Mountain Pipeline ULC',
                         'Trans Quebec and Maritimes Pipeline Inc.',
                         'Trans-Northern Pipelines Inc.',
                         'TransCanada Keystone Pipeline GP Ltd.',
                         'Westcoast Energy Inc.',
                         'Alliance Pipeline Ltd.',
                         'PKM Cochin ULC',
                         'Foothills Pipe Lines Ltd.',
                         'Southern Lights Pipeline',
                         'Emera Brunswick Pipeline Company Ltd.',
                         'Plains Midstream Canada ULC',
                         'Genesis Pipeline Canada Ltd.',
                         'Montreal Pipe Line Limited',
                         'Trans-Northern Pipelines Inc.',
                         'Kingston Midstream Westspur Limited',
                         'Many Islands Pipe Lines (Canada) Limited',
                         'Vector Pipeline Limited Partnership',
                         'Maritimes & Northeast Pipeline Management Ltd.',
                         'Aurora Pipeline Company Ltd']

    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Company Name'] == company].copy().reset_index(drop=True)
        thisCompanyData = {}

        if not df_c.empty:
            thisCompanyData["meta"] = {"companyName": company}
            thisCompanyData["build"] = True
            thisCompanyData["data"] = optimizeJson(df_c)
            if not test:
                with open('../remediation/company_data/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)
        else:
            # there are no o and m events
            thisCompanyData['data'] = df_c.to_dict(orient='records')
            thisCompanyData['meta'] = {"companyName": company}
            thisCompanyData["build"] = False
            if not test:
                with open('../remediation/company_data/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)

    return df


if __name__ == "__main__":
    df = process_remediation(False)

