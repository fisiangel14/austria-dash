/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/incidents              ->  index
 */


'use strict';

var db = require("../../utils/db");
var _und = require("underscore");
var moment = require("moment");
const async = require("async");

export function getApiEndpoint(req, res, next) {
  if (req.params.apiEndpoint === "getIncidents") {

    if (req.query.opcoId === '0') {
      db.query("select * from AMX_INCIDENT order by STATUS desc, OPENING_DATE desc",
        [],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            next(err);
          } else {
            res.json(row);
          }
        });
    } else {
      db.query("select * from AMX_INCIDENT where OPCO_ID = ? order by STATUS desc, OPENING_DATE desc",
        [req.query.opcoId],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            next(err);
          } else {
            res.json(row);
          }
        });
    }

  } else if (req.params.apiEndpoint === "getAreaIncidents") {
    console.log(req.query.area, req.query.showAll, req.query.fromDate, req.query.toDate);

    if (req.query.opcoId === '0') {
      db.query(`select * 
                from AMX_INCIDENT i 
                where 1=1
                  and AREA = ? 
                  and (
                      (? = 'Y' and ifnull(i.closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
                      or (? = 'N' and i.closing_date between ? and date_add(?, interval 24 HOUR) )
                    )
                  order by STATUS desc, OPENING_DATE desc`,
      [req.query.area, req.query.showAll, req.query.fromDate, req.query.toDate, req.query.showAll, req.query.fromDate, req.query.toDate],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });  
    } else {    
      db.query(`select * 
      from AMX_INCIDENT i
      where 1=1
        and AREA = ? 
        and OPCO_ID = ?
        and (
            (? = 'Y' and ifnull(i.closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
            or (? = 'N' and i.closing_date between ? and date_add(?, interval 24 HOUR) )
          )
        order by STATUS desc, OPENING_DATE desc`,
      [req.query.area, req.query.opcoId, req.query.showAll, req.query.fromDate, req.query.toDate, req.query.showAll, req.query.fromDate, req.query.toDate],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });  
    }

  } 
   
  else if (req.params.apiEndpoint === "getBAIncidents") {
    console.log(req.query.area, req.query.showAll, req.query.fromDate, req.query.toDate);
    if (req.query.opcoId !== '0' && req.query.area === '$.NA' ) {
      db.query(`select * 
      from AMX_INCIDENT i
      where 1=1
        and (IFNULL(BUSINESS_ASSURANCE_DOMAIN, 'null') = 'null' or BUSINESS_ASSURANCE_DOMAIN not like '%"Y"%')
        and OPCO_ID = ?
        and (
            (? = 'Y' and ifnull(i.closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
            or (? = 'N' and i.closing_date between ? and date_add(?, interval 24 HOUR) )
          )
        order by STATUS desc, OPENING_DATE desc`,
      [req.query.opcoId, req.query.showAll, req.query.fromDate, req.query.toDate, req.query.showAll, req.query.fromDate, req.query.toDate],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });  
    } 
    else if (req.query.opcoId === '0' && req.query.area !== '$.NA' ) {
      db.query(`select * 
                from AMX_INCIDENT i 
                where 1=1
                  and IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.' || ?),'"',''),'N') = 'Y'
                  and (
                      (? = 'Y' and ifnull(i.closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
                      or (? = 'N' and i.closing_date between ? and date_add(?, interval 24 HOUR) )
                    )
                  order by STATUS desc, OPENING_DATE desc`,
      [req.query.area, req.query.showAll, req.query.fromDate, req.query.toDate, req.query.showAll, req.query.fromDate, req.query.toDate],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });  
    } else if (req.query.area !== '$.NA') {    
      db.query(`select * 
      from AMX_INCIDENT i
      where 1=1
        and IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, ?),'"',''),'N') = 'Y'
        and OPCO_ID = ?
        and (
            (? = 'Y' and ifnull(i.closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
            or (? = 'N' and i.closing_date between ? and date_add(?, interval 24 HOUR) )
          )
        order by STATUS desc, OPENING_DATE desc`,
      [req.query.area, req.query.opcoId, req.query.showAll, req.query.fromDate, req.query.toDate, req.query.showAll, req.query.fromDate, req.query.toDate],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });  
    }

  }
  else if (req.params.apiEndpoint === "getIncidentReport") {

    if (req.query.opcoId === '0') {
      db.query("select a.*, c.USERNAME from AMX_INCIDENT a left join AMX_USER c on c.EMAIL = a.CREATED_BY where (a.OPENING_DATE <= ? and ifnull(a.CLOSING_DATE, ?) >= ?) and a.STATUS like ? order by a.CLOSING_DATE",
        [req.query.toDate, req.query.toDate, req.query.fromDate, req.query.includeOpen],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            next(err);
          } else {
            res.json(row);
          }
        });
    } else {
      console.log(req.query.toDate, req.query.toDate, req.query.fromDate, req.query.includeOpen);
      db.query("select a.*, c.USERNAME from AMX_INCIDENT a left join AMX_USER c on c.EMAIL = a.CREATED_BY where a.OPCO_ID = ? and (a.OPENING_DATE <= ? and ifnull(a.CLOSING_DATE, ?) >= ?) and a.STATUS like ? order by a.STATUS desc, a.OPENING_DATE ",
        [req.query.opcoId, req.query.toDate, req.query.toDate, req.query.fromDate, req.query.includeOpen],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            next(err);
          } else {
            res.json(row);
          }
        });
    }

  } else if (req.params.apiEndpoint === "getIncidentInfo") {

    db.query("select * from AMX_INCIDENT where INCIDENT_ID = ?", [req.query.incidentId],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row[0]);
        }
      });
  } else if (req.params.apiEndpoint === "getAmxProcedures") {

    db.query("SELECT PROCEDURE_AMX_ID, PROCEDURE_NAME, PROCESS_AREA FROM amx_procedure_catalogue;",
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });
  } else if (req.params.apiEndpoint === "getBalancedScorecard") {
      var inYear = req.query.year;
      var inFromDate = req.query.fromDate;
      var inToDate = req.query.toDate;

      if (!inYear && !inFromDate) {
        inYear = moment().format("YYYY");
      }
      else if (!inYear) {
        inYear = moment(inFromDate).format("YYYY");
      }

      if (!inFromDate || !inToDate) {
        inFromDate = inYear + "-01-01";
        inToDate = inYear + "-12-31";
      }

      async.parallel(
        {
            // Get KPIs
            'KPI': function(cb) {          
              db.query(`select 
              o.OPCO_ID,
              o.OPCO_NAME,
              sum(case when IMPACT_TYPE = 'Revenue loss' then ifnull(IMPACT, 0) else 0 end) I_REVENUE_LOSS,
              sum(case when IMPACT_TYPE = 'Revenue loss' then ifnull(RECOVERED, 0) else 0 end) R_REVENUE_LOSS,
              sum(case when IMPACT_TYPE = 'Revenue loss' then ifnull(PREVENTED, 0) else 0 end) P_REVENUE_LOSS,
              sum(case when IMPACT_TYPE = 'Excessive costs' then ifnull(IMPACT, 0) else 0 end) I_EXCESSIVE_COSTS,
              sum(case when IMPACT_TYPE = 'Excessive costs' then ifnull(RECOVERED, 0) else 0 end) R_EXCESSIVE_COSTS,
              sum(case when IMPACT_TYPE = 'Excessive costs' then ifnull(PREVENTED, 0) else 0 end) P_EXCESSIVE_COSTS,
              sum(case when IMPACT_TYPE = 'Overcharging' then ifnull(IMPACT, 0) else 0 end) I_OVERCHARGING,
              sum(case when IMPACT_TYPE = 'Overcharging' then ifnull(RECOVERED, 0) else 0 end) R_OVERCHARGING,
              sum(case when IMPACT_TYPE = 'Overcharging' then ifnull(PREVENTED, 0) else 0 end) P_OVERCHARGING,
              sum(case when IMPACT_TYPE = 'Financial reporting misstatement' then ifnull(IMPACT, 0) else 0 end) I_FINANCIAL_REPORTING_MISSTATEMENT,
              sum(case when IMPACT_TYPE = 'Financial reporting misstatement' then ifnull(RECOVERED, 0) else 0 end) R_FINANCIAL_REPORTING_MISSTATEMENT,
              sum(case when IMPACT_TYPE = 'Financial reporting misstatement' then ifnull(PREVENTED, 0) else 0 end) P_FINANCIAL_REPORTING_MISSTATEMENT,
              sum(case when IMPACT_TYPE = 'Revenue loss' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) IMPACT_REVENUE_LOSS,
              sum(case when IMPACT_TYPE = 'Excessive costs' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) IMPACT_EXCESSIVE_COSTS,
              sum(case when IMPACT_TYPE = 'Overcharging' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) IMPACT_OVERCHARGING,
              sum(case when IMPACT_TYPE = 'Financial reporting misstatement' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) IMPACT_FINANCIAL_REPORTING_MISSTATEMENT,
              sum(case when IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) FINANCIAL_IMPACT,
              sum(case when IMPACT_TYPE in ('Excessive costs', 'Revenue loss') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) REVENUE_IMPACT,		    
              sum(case when INCIDENT_ID is not null and ifnull(IMPACT, 0) = 0 and ifnull(RECOVERED, 0) = 0 and ifnull(PREVENTED, 0) = 0 then 1 else 0 end) INCIDENT_COUNT_NO_LOSS,
              sum(case when INCIDENT_ID is not null and (ifnull(IMPACT, 0) > 0 or ifnull(RECOVERED, 0) > 0 or ifnull(PREVENTED, 0) > 0) and IMPACT_TYPE not in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then 1 else 0 end) INCIDENT_COUNT_NON_MONETARY,
              count(INCIDENT_ID) INCIDENT_COUNT_TOTAL,
              cvgGetTotalOpcoValueHistory(o.opco_id, concat(?, '-12-31')) TOTAL_REVENUES,
              cvgGetTotalOpcoCoverageHistory(o.opco_id, concat(?, '-12-31')) TOTAL_COVERAGE,
              sum(case when IMPACT_TYPE in ('Excessive costs', 'Revenue loss') then ifnull(IMPACT, 0) else 0 end) REVENUE_LOST,
              sum(case when IMPACT_TYPE in ('Overcharging') then ifnull(IMPACT, 0) else 0 end) REVENUE_OVERCHARGED,
              sum(case when IMPACT_TYPE in ('Financial reporting misstatement') then ifnull(IMPACT, 0) else 0 end) REVENUE_MISSREPORTED,
              sum(case when IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(RECOVERED, 0) else 0 end) RECOVERED_IMPACT_TOTAL,
              sum(case when IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(PREVENTED, 0) else 0 end) PREVENTED_IMPACT_TOTAL,
              -- avg(case when IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then datediff(ifnull(CREATED, current_date()), ifnull(OPENING_DATE, current_date())) else null end) MEAN_TIME_TO_DETECT,
              -- avg(case when IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then datediff(ifnull(CLOSING_DATE, current_date()), ifnull(CREATED, current_date())) else null end) MEAN_TIME_TO_CLOSE,
              -- avg(case when IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') and ifnull(RECOVERED, 0) > 0 then datediff(ifnull(CLOSING_DATE, current_date()), ifnull(CREATED, current_date())) else null end) MEAN_TIME_TO_RECOVER,
              getIncidentMedianTimeProblemToDetection(o.opco_id, ?) MEDIAN_TIME_PROBLEM_TO_DETECTION, 
	            getIncidentMedianTimeDetectionToResolution(o.opco_id, ?) MEDIAN_TIME_DETECTION_TO_RESOLUTION,
              getIncidentMedianTimeProblemToResolution(o.opco_id, ?) MEDIAN_TIME_PROBLEM_TO_RESOLUTION,
              sum(case when IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') and ifnull(RECOVERED, 0) > 0 then 1 else 0 end) INCIDENT_COUNT_RECOVER,
              sum(case when area = 'Collection' then 1 else 0 end) COLLECTION_INCIDENT_COUNT,
              sum(case when area = 'Accounting' then 1 else 0 end) ACCOUNTING_INCIDENT_COUNT,
              sum(case when area = 'Value Added Services' then 1 else 0 end) VALUE_ADDED_SERVICES_INCIDENT_COUNT,
              sum(case when area = 'Billing' then 1 else 0 end) BILLING_INCIDENT_COUNT,
              sum(case when area = 'Interconnection' then 1 else 0 end) INTERCONNECTION_INCIDENT_COUNT,
              sum(case when area = 'Logistics' then 1 else 0 end) LOGISTICS_INCIDENT_COUNT,
              sum(case when area = 'Mediation' then 1 else 0 end) MEDIATION_INCIDENT_COUNT,
              sum(case when area = 'Prepaid' then 1 else 0 end) PREPAID_INCIDENT_COUNT,
              sum(case when area = 'Provisioning' then 1 else 0 end) PROVISIONING_INCIDENT_COUNT,
              sum(case when area = 'Roaming' then 1 else 0 end) ROAMING_INCIDENT_COUNT,
              sum(case when area = 'Rating' then 1 else 0 end) RATING_INCIDENT_COUNT,
              sum(case when area = 'Treasury' then 1 else 0 end) TREASURY_INCIDENT_COUNT,
              sum(case when area = 'Collection' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) COLLECTION_INCIDENT_VALUE,
              sum(case when area = 'Accounting' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) ACCOUNTING_INCIDENT_VALUE,
              sum(case when area = 'Value Added Services' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) VALUE_ADDED_SERVICES_INCIDENT_VALUE,
              sum(case when area = 'Billing' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BILLING_INCIDENT_VALUE,
              sum(case when area = 'Interconnection' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) INTERCONNECTION_INCIDENT_VALUE,
              sum(case when area = 'Logistics' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) LOGISTICS_INCIDENT_VALUE,
              sum(case when area = 'Mediation' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) MEDIATION_INCIDENT_VALUE,
              sum(case when area = 'Prepaid' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) PREPAID_INCIDENT_VALUE,
              sum(case when area = 'Provisioning' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) PROVISIONING_INCIDENT_VALUE,
              sum(case when area = 'Roaming' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) ROAMING_INCIDENT_VALUE,
              sum(case when area = 'Rating' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) RATING_INCIDENT_VALUE,
              sum(case when area = 'Treasury' and IMPACT_TYPE in ('Excessive costs', 'Revenue loss', 'Financial reporting misstatement', 'Overcharging') then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) TREASURY_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.RevenueAndCostAssurance'),'"',''),'N') = 'Y' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_REVENUEANDCOSTASSURANCE_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.RevenueAndCostAssurance'),'"',''),'N') = 'Y' then 1 else 0 end) BA_REVENUEANDCOSTASSURANCE_INCIDENT_COUNT,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.MarginAssurance'),'"',''),'N') = 'Y' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_MARGINASSURANCE_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.MarginAssurance'),'"',''),'N') = 'Y' then 1 else 0 end) BA_MARGINASSURANCE_INCIDENT_COUNT,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.AssetAssurance'),'"',''),'N') = 'Y' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_ASSETASSURANCE_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.AssetAssurance'),'"',''),'N') = 'Y' then 1 else 0 end) BA_ASSETASSURANCE_INCIDENT_COUNT,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.MigrationAssurance'),'"',''),'N') = 'Y' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_MIGRATIONASSURANCE_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.MigrationAssurance'),'"',''),'N') = 'Y' then 1 else 0 end) BA_MIGRATIONASSURANCE_INCIDENT_COUNT,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.FraudManagement'),'"',''),'N') = 'Y' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_FRAUDMANAGEMENT_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.FraudManagement'),'"',''),'N') = 'Y' then 1 else 0 end) BA_FRAUDMANAGEMENT_INCIDENT_COUNT,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.RegulatoryAssurance'),'"',''),'N') = 'Y' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_REGULATORYASSURANCE_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.RegulatoryAssurance'),'"',''),'N') = 'Y' then 1 else 0 end) BA_REGULATORYASSURANCE_INCIDENT_COUNT,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.DigitalTransformationAssurance'),'"',''),'N') = 'Y' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_DIGITALTRANSFORMATIONASSURANCE_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.DigitalTransformationAssurance'),'"',''),'N') = 'Y' then 1 else 0 end) BA_DIGITALTRANSFORMATIONASSURANCE_INCIDENT_COUNT,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.DigitalEcosystemAssurance'),'"',''),'N') = 'Y' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_DIGITALECOSYSTEMASSURANCE_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.DigitalEcosystemAssurance'),'"',''),'N') = 'Y' then 1 else 0 end) BA_DIGITALECOSYSTEMASSURANCE_INCIDENT_COUNT,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.CustomerExperience'),'"',''),'N') = 'Y' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_CUSTOMEREXPERIENCE_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.CustomerExperience'),'"',''),'N') = 'Y' then 1 else 0 end) BA_CUSTOMEREXPERIENCE_INCIDENT_COUNT,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.CustomerJourney'),'"',''),'N') = 'Y' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_CUSTOMERJOURNEY_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.CustomerJourney'),'"',''),'N') = 'Y' then 1 else 0 end) BA_CUSTOMERJOURNEY_INCIDENT_COUNT,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.CustomerEquipmentAssurance'),'"',''),'N') = 'Y' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_CUSTOMEREQUIPMENTASSURANCE_INCIDENT_VALUE,
              sum(case when IFNULL(REPLACE(JSON_EXTRACT(BUSINESS_ASSURANCE_DOMAIN, '$.CustomerEquipmentAssurance'),'"',''),'N') = 'Y' then 1 else 0 end) BA_CUSTOMEREQUIPMENTASSURANCE_INCIDENT_COUNT,
              sum(case when IFNULL(BUSINESS_ASSURANCE_DOMAIN, 'null') = 'null' or BUSINESS_ASSURANCE_DOMAIN not like '%"Y"%' then ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) else 0 end) BA_NA_INCIDENT_VALUE,
              sum(case when IFNULL(BUSINESS_ASSURANCE_DOMAIN, 'null') = 'null' or BUSINESS_ASSURANCE_DOMAIN not like '%"Y"%' then 1 else 0 end) BA_NA_INCIDENT_COUNT            
              from amx_opco o
              left join amx_incident i on 1=1
              and i.opco_id = o.opco_id 
              and (
                  (? = 'Y' and ifnull(i.closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
                  or (? = 'N' and i.closing_date between ? and date_add(?, interval 24 HOUR) )
              )
              where o.OPCO_ID not in (0, 99) and o.OPCO_ID = ?
              group by o.OPCO_ID, o.OPCO_NAME`,
              [inYear, inYear, inYear, inYear, inYear, 
                req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate, 
                req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate, 
                req.query.opcoId],
              function (err, row) {
                if (err !== null) {req.query.year
                  console.log(err);
                  cb(err);
                } else {
                  cb(null, row[0])
                }
              });
            },
            // Top incidents
            'topIncidents': function(cb) {
              
              db.query(`
              select
                OPCO_ID,
                INCIDENT_ID,
                IMPACT_TYPE,
                OPENING_DATE,
                CLOSING_DATE,
                PROBLEM_DESCRIPTION,
                CORRECTIVE_ACTION,
                ifnull(IMPACT, 0) IMPACT,
                ifnull(RECOVERED, 0) RECOVERED,
                ifnull(PREVENTED, 0) PREVENTED
              from amx_incident i
              where 1=1
                  and OPCO_ID = ?
                  and IMPACT_TYPE in ("Revenue loss", "Excessive costs", "Financial reporting misstatement")
                  and (
                    (? = 'Y' and ifnull(i.closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
                    or (? = 'N' and i.closing_date between ? and date_add(?, interval 24 HOUR) )
                  )
              order by ifnull(IMPACT, 0) + ifnull(RECOVERED, 0) + ifnull(PREVENTED, 0) desc
              limit 5
              `,
              [req.query.opcoId, 
                req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate,
                req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate
              ],
              function (err, row) {
                if (err !== null) {
                  console.log(err);
                  cb(err);
                } else {
                  cb(null, row)
                }
              });

            },
            // Times to handle an incident
            'incidentTimes': function(cb) {
              db.query(`
              select 
                count(distinct i.INCIDENT_ID) INCIDENT_COUNT_DISTINCT
              from amx_incident i
              left join amx_alarm a on a.INCIDENT_ID = i.INCIDENT_ID
              where upper(concat(ifnull(a.OBJECT_ID, i.METRIC_ID),'|', i.CLASIFICATION)) in (
                select tag from
                (
                  select 
                    upper(concat(ifnull(a.OBJECT_ID, i.METRIC_ID),'|', i.CLASIFICATION)) tag
                  from amx_incident i 
                  left join amx_alarm a on a.INCIDENT_ID = i.INCIDENT_ID
                  where 1=1
                    and i.OPCO_ID = ?
                    and (
                      (? = 'Y' and ifnull(i.closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
                      or (? = 'N' and i.closing_date between ? and date_add(?, interval 24 HOUR) )
                    )                
                  group by 1
                  having count(*) = 1
                ) s
              ) and i.OPCO_ID = ?
              and (
                (? = 'Y' and ifnull(i.closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
                or (? = 'N' and i.closing_date between ? and date_add(?, interval 24 HOUR) )
              )
              `,
              [req.query.opcoId, req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate, req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate, req.query.opcoId, req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate, req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate],
              function (err, row) {
                if (err !== null) {
                  console.log(err);
                  cb(err);
                } else {
                  cb(null, row[0])
                }
              });
            },
            // Distinct cases
            'distinctCases': function(cb) {
              db.query(`
              select 
                count(distinct i.INCIDENT_ID) INCIDENT_COUNT_DISTINCT
              from amx_incident i
              left join amx_alarm a on a.INCIDENT_ID = i.INCIDENT_ID
              where upper(concat(ifnull(a.OBJECT_ID, i.METRIC_ID),'|', i.CLASIFICATION)) in (
                select tag from
                (
                  select 
                    upper(concat(ifnull(a.OBJECT_ID, i.METRIC_ID),'|', i.CLASIFICATION)) tag
                  from amx_incident i 
                  left join amx_alarm a on a.INCIDENT_ID = i.INCIDENT_ID
                  where 1=1
                    and i.OPCO_ID = ?
                    and (
                      (? = 'Y' and ifnull(i.closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
                      or (? = 'N' and i.closing_date between ? and date_add(?, interval 24 HOUR) )
                    )                 
                  group by 1
                  having count(*) = 1
                ) s
              ) and i.OPCO_ID = ?
              and (
                (? = 'Y' and ifnull(i.closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
                or (? = 'N' and i.closing_date between ? and date_add(?, interval 24 HOUR) )
              )
              `,
              [req.query.opcoId, req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate, req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate, req.query.opcoId, req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate, req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate],              function (err, row) {
                if (err !== null) {
                  console.log(err);
                  cb(err);
                } else {
                  cb(null, row[0])
                }
              });
            },
            // Metric statistics
            'metricStats': function(cb) {
              db.query(`
              select
                  avg(case when metric_id = 'F6' then value else null end) F6,
                  avg(case when metric_id = 'F11' then value else null end) F11
                from amx_metric_result i
                where 1=1
                  and i.OPCO_ID = ?
                  and (
                    (? = 'Y' and ifnull(i.date, current_date()) between ? and date_add(?, interval 24 HOUR))
                    or (? = 'N' and i.date between ? and date_add(?, interval 24 HOUR) )
                  )
              `,
              [req.query.opcoId, 
                req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate,
                req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate                
              ],
              function (err, row) {
                if (err !== null) {
                  console.log(err);
                  cb(err);
                } else {
                  cb(null, row[0])
                }
              });
            },
            // Harvest
            'harvest': function(cb) {
              db.query(`
                select
                  sum(case when IMPACT_TYPE in ("Revenue loss", "Excessive costs") then ifnull(RECOVERED, 0) else 0 end) RECOVERED,
                  sum(case when IMPACT_TYPE in ("Revenue loss", "Excessive costs") then ifnull(PREVENTED, 0) else 0 end) PREVENTED,
                  sum(case when IMPACT_TYPE in ("Revenue loss", "Excessive costs") then ifnull(IMPACT, 0) else 0 end) IMPACT,
                  sum(case when IMPACT_TYPE in ("Financial reporting misstatement") then ifnull(RECOVERED, 0) else 0 end) RECOVERED_FINANCIAL_REPORTING,
                  sum(case when IMPACT_TYPE in ("Financial reporting misstatement") then ifnull(PREVENTED, 0) else 0 end) PREVENTED_FINANCIAL_REPORTING,
                  sum(case when IMPACT_TYPE in ("Financial reporting misstatement") then ifnull(IMPACT, 0) else 0 end) IMPACT_FINANCIAL_REPORTING
              from amx_incident
              where 1=1
                  and OPCO_ID = ?
                  and IMPACT_TYPE in ("Revenue loss", "Excessive costs", "Financial reporting misstatement")
                  and (
                    (? = 'Y' and ifnull(closing_date, current_date()) between ? and date_add(?, interval 24 HOUR))
                    or (? = 'N' and closing_date between ? and date_add(?, interval 24 HOUR) )
                  )
              `,
              [req.query.opcoId,                 
                req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate,
                req.query.balancedScorecardShowAllIncidents, inFromDate, inToDate   ],
              function (err, row) {
                if (err !== null) {
                  console.log(err);
                  cb(err);
                } else {
                  cb(null, row[0])
                }
              });
            },
            // Count controls and metrics
            'controls': function(cb) {
              db.query(`
              select * from
              (
                select 
                count(case when c.CONTROL_TYPE = 'M' then 1 else null end) COUNT_ACTIVE_METRIC,
                  count(case when c.CONTROL_TYPE = 'C' then 1 else null end) COUNT_ACTIVE_CONTROLS
              from v_cvg_control c
              where 1=1
                and c.STATUS_CODE = 'A'
                and c.OPCO_ID = ? 
                and ? between c.start_date and ifnull(c.end_date, ?)
              ) j1
              
              cross join 

              (
                select 
                  sum(case when CONTROL_TYPE = 'M' then CNT else 0 end) COUNT_ACTIVE_METRIC_ALARMS,
                    sum(case when CONTROL_TYPE = 'C' then CNT else 0 end) COUNT_ACTIVE_CONTROLS_ALARMS
                from
                (
                  SELECT 
                    c.CONTROL_TYPE, 
                    count(distinct c.CONTROL_NAME) CNT
                  from v_cvg_control c
                  join amx_alarm a on a.OBJECT_ID = c.CONTROL_NAME
                  where 1=1
                    and a.OPCO_ID = ?
                    and a.OBJECT_DATE between ? and ?
                  group by c.CONTROL_TYPE
                ) s
              ) j2

              cross join 

              (
                select 
                  avg(case when c.CONTROL_TYPE = 'C' then rnc.effectiveness else null end) AVG_CONTROL_EFFECTIVINESS,
                  avg(case when c.CONTROL_TYPE = 'M' then rnc.effectiveness else null end) AVG_METRIC_EFFECTIVINESS
                from v_cvg_control c
                left join cvg_risk_node_control rnc on rnc.control_id = c.control_id
                where 1=1
                  and c.STATUS_CODE = 'A'
                  and c.OPCO_ID = ? 
                  and ? between c.start_date and ifnull(c.end_date, ?)
              ) j3

              cross join 

              (
                select 
                  sum(case when c.CONTROL_TYPE = 'C' and RevenueAndCostAssurance = 'Y' then 1 else 0 end) CNT_CONTROL_BA_REVENUEANDCOSTASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'M' and RevenueAndCostAssurance = 'Y' then 1 else 0 end) CNT_METRIC_BA_REVENUEANDCOSTASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'C' and MarginAssurance = 'Y' then 1 else 0 end) CNT_CONTROL_BA_MARGINASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'M' and MarginAssurance = 'Y' then 1 else 0 end) CNT_METRIC_BA_MARGINASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'C' and AssetAssurance = 'Y' then 1 else 0 end) CNT_CONTROL_BA_ASSETASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'M' and AssetAssurance = 'Y' then 1 else 0 end) CNT_METRIC_BA_ASSETASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'C' and MigrationAssurance = 'Y' then 1 else 0 end) CNT_CONTROL_BA_MIGRATIONASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'M' and MigrationAssurance = 'Y' then 1 else 0 end) CNT_METRIC_BA_MIGRATIONASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'C' and FraudManagement = 'Y' then 1 else 0 end) CNT_CONTROL_BA_FRAUDMANAGEMENT,
                  sum(case when c.CONTROL_TYPE = 'M' and FraudManagement = 'Y' then 1 else 0 end) CNT_METRIC_BA_FRAUDMANAGEMENT,
                  sum(case when c.CONTROL_TYPE = 'C' and RegulatoryAssurance = 'Y' then 1 else 0 end) CNT_CONTROL_BA_REGULATORYASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'M' and RegulatoryAssurance = 'Y' then 1 else 0 end) CNT_METRIC_BA_REGULATORYASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'C' and DigitalTransformationAssurance = 'Y' then 1 else 0 end) CNT_CONTROL_BA_DIGITALTRANSFORMATIONASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'M' and DigitalTransformationAssurance = 'Y' then 1 else 0 end) CNT_METRIC_BA_DIGITALTRANSFORMATIONASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'C' and DigitalEcosystemAssurance = 'Y' then 1 else 0 end) CNT_CONTROL_BA_DIGITALECOSYSTEMASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'M' and DigitalEcosystemAssurance = 'Y' then 1 else 0 end) CNT_METRIC_BA_DIGITALECOSYSTEMASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'C' and CustomerExperience = 'Y' then 1 else 0 end) CNT_CONTROL_BA_CUSTOMEREXPERIENCE,
                  sum(case when c.CONTROL_TYPE = 'M' and CustomerExperience = 'Y' then 1 else 0 end) CNT_METRIC_BA_CUSTOMEREXPERIENCE,
                  sum(case when c.CONTROL_TYPE = 'C' and CustomerJourney = 'Y' then 1 else 0 end) CNT_CONTROL_BA_CUSTOMERJOURNEY,
                  sum(case when c.CONTROL_TYPE = 'M' and CustomerJourney = 'Y' then 1 else 0 end) CNT_METRIC_BA_CUSTOMERJOURNEY,
                  sum(case when c.CONTROL_TYPE = 'C' and CustomerEquipmentAssurance = 'Y' then 1 else 0 end) CNT_CONTROL_BA_CUSTOMEREQUIPMENTASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'M' and CustomerEquipmentAssurance = 'Y' then 1 else 0 end) CNT_METRIC_BA_CUSTOMEREQUIPMENTASSURANCE,
                  sum(case when c.CONTROL_TYPE = 'C' and RevenueAndCostAssurance = 'N' and MarginAssurance = 'N' and AssetAssurance = 'N' and MigrationAssurance = 'N' and FraudManagement = 'N' and RegulatoryAssurance = 'N' and DigitalTransformationAssurance = 'N' and DigitalEcosystemAssurance = 'N' and CustomerExperience = 'N' and CustomerJourney = 'N' and CustomerEquipmentAssurance = 'N' then 1 else 0 end) CNT_CONTROL_BA_NA,
                  sum(case when c.CONTROL_TYPE = 'M' and RevenueAndCostAssurance = 'N' and MarginAssurance = 'N' and AssetAssurance = 'N' and MigrationAssurance = 'N' and FraudManagement = 'N' and RegulatoryAssurance = 'N' and DigitalTransformationAssurance = 'N' and DigitalEcosystemAssurance = 'N' and CustomerExperience = 'N' and CustomerJourney = 'N' and CustomerEquipmentAssurance = 'N' then 1 else 0 end) CNT_METRIC_BA_NA
                from v_cvg_control c
                where 1=1
                  and c.STATUS_CODE = 'A'
                  and c.OPCO_ID = ? 
                  and ? between c.start_date and ifnull(c.end_date, ?)
              ) j4              
              `,
              [req.query.opcoId, inToDate, inToDate, req.query.opcoId, inFromDate, inToDate, req.query.opcoId, inToDate, inToDate, req.query.opcoId, inToDate, inToDate],
              function (err, row) {
                if (err !== null) {
                  console.log(err);
                  cb(err);
                } else {
                  cb(null, row[0])
                }
              });
            },
            // Count alarms
            'alarms': function(cb) {
              db.query(`
              SELECT 
                sum(case when SEVERITY_ID = 1 then 1 else 0 end) COUNT_INFO,
                sum(case when SEVERITY_ID = 2 then 1 else 0 end) COUNT_WARNING,
                sum(case when SEVERITY_ID = 3 then 1 else 0 end) COUNT_ERROR,
                avg(case when status = 'Closed' then datediff(MODIFIED, CREATED) else null end) AVG_RESOLUTION_TIME,
                sum(case when status != 'Closed' then 1 else 0 end) REMAINING_OPEN_ALARMS
              FROM tag.amx_alarm
              where 1=1
                and OPCO_ID = ? 
                and  created between ? and date_add(?, interval 24 HOUR) 
              `,
              [req.query.opcoId, inFromDate, inToDate],
              function (err, row) {
                if (err !== null) {
                  console.log(err);
                  cb(err);
                } else {
                  cb(null, row[0])
                }
              });
            }
          },
          // finally
          function (err, results) {
            if (!err) {
              return res.status(200).json({
                results: results,
                success: true
              });
            }
            else {
              return res.status(500).json({
                success: false  
              })
            }
          }
      );
        
      } else {
    res.json({
      success: false,
      error: 'Method not found: ' + req.params.apiEndpoint
    });
  }
}

export function postApiEndpoint(req, res, next) {
  var io = req.app.get('socketio');

  if (req.params.apiEndpoint === "postIncident") {
    if (typeof req.body.INCIDENT_ID !== "undefined") {
      db.query(`update AMX_INCIDENT set 
	    					OPCO_ID=?, 
	    					METRIC_ID=?, 
	    					METRIC_DESCRIPTION=?, 
	    					OPENING_DATE=?, 
	    					END_DATE=?, 
	    					CLOSING_DATE=?, 
	    					DUE_DATE=?, 
	    					CLASIFICATION=?, 
	    					PROBLEM_DESCRIPTION=?, 
	    					ROOT_CAUSE=?, 
	    					IMPACT_TYPE=?, 
	    					IMPACT=?, 
	    					RECOVERED=?, 
	    					PREVENTED=?, 
	    					SECONDARY_IMPACT_TYPE=?, 
	    					SECONDARY_IMPACT=?, 
	    					SECONDARY_RECOVERED=?, 
	    					SECONDARY_PREVENTED=?, 
                AFFECTED_CUSTOMERS=?, 
                IMPACT_ASSESSMENT_NOTES=?,
	    					CORRECTIVE_ACTION=?, 
	    					AREA=?, 
	    					RESPONSIBLE_TEAM=?, 
	    					RESPONSIBLE_PERSON=?, 
	    					RESPONSIBLE_DIRECTOR=?, 
	    					INC_NUMBER=?, 
	    					STATUS=?, 
                BUSINESS_ASSURANCE_DOMAIN=?,
	    					NOTES=?, 
	    					PROCEDURE_AMX_ID=?, 
	    					MODIFIED_BY=?,
	    					CREATED_BY=?,
	    					STATUS_BY=?
	    				where INCIDENT_ID=?`,
        [req.body.OPCO_ID,
          req.body.METRIC_ID,
          req.body.METRIC_DESCRIPTION,
          req.body.OPENING_DATE,
          req.body.END_DATE,
          req.body.CLOSING_DATE,
          req.body.DUE_DATE,
          req.body.CLASIFICATION,
          req.body.PROBLEM_DESCRIPTION,
          req.body.ROOT_CAUSE,
          req.body.IMPACT_TYPE,
          req.body.IMPACT,
          req.body.RECOVERED,
          req.body.PREVENTED,
          req.body.SECONDARY_IMPACT_TYPE,
          req.body.SECONDARY_IMPACT,
          req.body.SECONDARY_RECOVERED,
          req.body.SECONDARY_PREVENTED,
          req.body.AFFECTED_CUSTOMERS,
          req.body.IMPACT_ASSESSMENT_NOTES,
          req.body.CORRECTIVE_ACTION,
          req.body.AREA,
          req.body.RESPONSIBLE_TEAM,
          req.body.RESPONSIBLE_PERSON,
          req.body.RESPONSIBLE_DIRECTOR,
          req.body.INC_NUMBER,
          req.body.STATUS,
          JSON.stringify(req.body.BUSINESS_ASSURANCE_DOMAIN),
          req.body.NOTES,
          req.body.PROCEDURE_AMX_ID,
          req.body.MODIFIED_BY,
          req.body.CREATED_BY,
          req.body.STATUS_BY,
          req.body.INCIDENT_ID
        ],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            res.json({
              success: false,
              error: err
            });
          } else {
            io.emit('counters:update:' + req.body.OPCO_ID);
            res.json({
              success: true,
              incidentId: row.insertId
            });
          }
        });
    } else {
      db.query(`insert into AMX_INCIDENT 
	    					(	OPCO_ID, 
	    						METRIC_ID, 
	    						METRIC_DESCRIPTION, 
	    						OPENING_DATE,
	    						END_DATE,
	    						CLOSING_DATE,
	    						DUE_DATE, 
	    						CLASIFICATION, 
	    						PROBLEM_DESCRIPTION, 
	    						ROOT_CAUSE, 
	    						IMPACT_TYPE, 
	    						IMPACT, 
	    						RECOVERED, 
	    						PREVENTED, 
	    						SECONDARY_IMPACT_TYPE, 
	    						SECONDARY_IMPACT, 
	    						SECONDARY_RECOVERED, 
                  SECONDARY_PREVENTED, 
                  AFFECTED_CUSTOMERS,
                  IMPACT_ASSESSMENT_NOTES,
	    						CORRECTIVE_ACTION, 
	    						AREA, 
	    						RESPONSIBLE_TEAM, 
	    						RESPONSIBLE_PERSON, 
	    						RESPONSIBLE_DIRECTOR, 
	    						INC_NUMBER, 
	    						STATUS, 
                  BUSINESS_ASSURANCE_DOMAIN,
	    						NOTES, 
	    						PROCEDURE_AMX_ID, 
	    						MODIFIED_BY,
	    						CREATED_BY,
	    						STATUS_BY) 
	    				values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [req.body.OPCO_ID,
          req.body.METRIC_ID,
          req.body.METRIC_DESCRIPTION,
          req.body.OPENING_DATE,
          req.body.END_DATE,
          req.body.CLOSING_DATE,
          req.body.DUE_DATE,
          req.body.CLASIFICATION,
          req.body.PROBLEM_DESCRIPTION,
          req.body.ROOT_CAUSE,
          req.body.IMPACT_TYPE,
          req.body.IMPACT,
          req.body.RECOVERED,
          req.body.PREVENTED,
          req.body.SECONDARY_IMPACT_TYPE,
          req.body.SECONDARY_IMPACT,
          req.body.SECONDARY_RECOVERED,
          req.body.SECONDARY_PREVENTED,          
          req.body.AFFECTED_CUSTOMERS,          
          req.body.IMPACT_ASSESSMENT_NOTES,          
          req.body.CORRECTIVE_ACTION,
          req.body.AREA,
          req.body.RESPONSIBLE_TEAM,
          req.body.RESPONSIBLE_PERSON,
          req.body.RESPONSIBLE_DIRECTOR,
          req.body.INC_NUMBER,
          req.body.STATUS,
          JSON.stringify(req.body.BUSINESS_ASSURANCE_DOMAIN),
          req.body.NOTES,
          req.body.PROCEDURE_AMX_ID,
          req.body.MODIFIED_BY,
          req.body.CREATED_BY,
          req.body.STATUS_BY
        ],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            res.json({
              success: false,
              error: err
            });
          } else {
            io.emit('counters:update:' + req.body.OPCO_ID);
            res.json({
              success: true,
              incidentId: row.insertId
            });
          }
        });
    }
  }

  if (req.params.apiEndpoint === "archiveIncident") {
    //If success - update change request fileds
    db.query("update AMX_INCIDENT set ARCHIVED=? where INCIDENT_ID=?",
      [req.body.ARCHIVED, req.body.INCIDENT_ID],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          res.json({
            success: true
          });
        }
      });
  }
}

export function deleteIncident(req, res, next) {
  var io = req.app.get('socketio');
  db.query('delete from AMX_INCIDENT where INCIDENT_ID = ?',
    [req.query.id],
    function (err, row) {
      if (err !== null) {
        console.log(err);
        res.json({
          success: false,
          error: err
        });
      } else {
        io.emit('counters:update:' + req.body.OPCO_ID);
        res.json({
          success: true
        });
      }
    });
}
