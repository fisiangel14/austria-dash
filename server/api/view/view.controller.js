/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/view              ->  index
 */

'use strict';

var db = require("../../utils/db");

// Gets a list of Views
export function index(req, res) {
  res.json([]);
}


// Gets a list of Views
export function getApiEndpoint(req, res, next) {


  // Used in "Metric results" - missing datos for metric calculation
  if (req.params.apiEndpoint === "getMissingDatos") { 
    db.query(`select group_concat(DATO_ID  separator ', ') DATO_ID_MISSING
            from
            (
                select 
                    a.DATO_ID,
                    c.CNT,
                    sum(case when b.file_id > 0 then 1 else 0 end) CNT_FOUND
                from AMX_METRIC_DATO_LINK a
                join AMX_DATO_CATALOGUE dc on dc.OPCO_ID = a.OPCO_ID and dc.DATO_ID = a.DATO_ID and dc.RELEVANT = 'Y'
                join AMX_METRIC_CATALOGUE m on m.METRIC_ID = a.METRIC_ID
                    and m.OPCO_ID = a.OPCO_ID
                join V_DIM_DATO c on c.DATO_ID = a.DATO_ID
                    and c.OPCO_ID = a.OPCO_ID
                    and c.BILL_CYCLE = ?
                    and c.FREQUENCY = m.FREQUENCY                    
                left join AMX_FILE_DATO b on b.OPCO_ID = a.OPCO_ID 
                    and b.DATO_ID = a.DATO_ID
                    and ifnull(b.BILL_CYCLE, 0) = ifnull(c.BILL_CYCLE, 0)
                    and b.PERIODICITY_ID = c.PERIODICITY_ID
                    and b.DATE = ?
                where a.METRIC_ID = ?  and a.OPCO_ID = ?
                group by 
                    a.DATO_ID,
                    c.CNT
            ) sub1
            where CNT_FOUND < CNT`, 
      [req.query.billCycle, req.query.date, req.query.metricId, req.query.opcoId], 
      function(err, row) {
        if(err !== null) {
          console.log(err);
          next(err);
        }
        else {
          res.json(row[0]);
        }
    });
  }

  // Used in "Dato files"

  if (req.params.apiEndpoint === "getDatoFiles") { 
    db.query(`select 
              a.*,
              datediff(curdate(), a.FILE_MODIFY_DATE) FILE_AGE
            from AMX_FILE_LOG a 
            where 1=1
              and CREATED between ? and ? 
            order by CREATED desc`, 
      [req.query.fromDate, req.query.toDate], 
      function(err, row) {
        if(err !== null) {
          console.log(err);
          next(err);
        }
        else {
          res.json(row);
        }
    });
  }

  // Used in "Metric results overview"

  if (req.params.apiEndpoint === "getMetricResultsSummary") { 
    db.query(`select * from
      (
        SELECT 
             a.OPCO_ID,
             a.METRIC_ID,
             a.FREQUENCY,
             a.AREA_ID, 
             a.NAME,  
             a.IMPLEMENTED,        
             sum(CASE WHEN a.START_DATE <= t.DATE and ((b.VALUE <= (a.OBJECTIVE)) or (b.VALUE > (a.OBJECTIVE) AND b.VALUE <= (a.OBJECTIVE + a.TOLERANCE) and a.TREND='Y')) THEN 1 ELSE 0 END) GREEN,
             sum(CASE WHEN a.START_DATE <= t.DATE and (b.VALUE > (a.OBJECTIVE) AND b.VALUE <= (a.OBJECTIVE + a.TOLERANCE) and a.TREND='N') THEN 1 ELSE 0 END) YELLOW,
             sum(CASE WHEN a.START_DATE <= t.DATE and (b.VALUE > (a.OBJECTIVE + a.TOLERANCE) and a.TREND='N') THEN 1 ELSE 0 END) RED,
             sum(CASE WHEN a.START_DATE <= t.DATE and (b.VALUE > (a.OBJECTIVE + a.TOLERANCE) and a.TREND='Y') THEN 1 ELSE 0 END) ORANGE,
             sum(case when a.START_DATE <= t.DATE and ((b.RESULT_ID is null or b.ERROR_CODE is not null) and datediff(curdate(), t.DATE) > ifnull(dm.DELAY,2)) then 1 else 0 end) NO_RESULT
        FROM AMX_TIME_DAY t
        JOIN AMX_METRIC_CATALOGUE a ON 1 = 1
        left join V_DIM_METRIC dm on dm.OPCO_ID = a.OPCO_ID
            and dm.METRIC_ID = a.METRIC_ID
        LEFT JOIN AMX_METRIC_RESULT b ON   
            b.METRIC_ID = a.METRIC_ID 
            and b.OPCO_ID = a.OPCO_ID 
            and b.DATE = t.DATE
            and ifnull(b.BILL_CYCLE, 0) = ifnull(dm.BILL_CYCLE, 0)
        WHERE a.FREQUENCY = 'D'
            and a.RELEVANT = 'Y'
            and a.OPCO_ID = ?
            and t.DATE BETWEEN ? AND ?
       GROUP BY  
                 a.OPCO_ID,
                 a.METRIC_ID,
                 a.FREQUENCY,
                 a.AREA_ID, 
                 a.NAME,
                 a.IMPLEMENTED 

        union

        SELECT 
          a.OPCO_ID,
          a.METRIC_ID,
          a.FREQUENCY,
          a.AREA_ID, 
          a.NAME,
          a.IMPLEMENTED,      
          sum(CASE WHEN a.START_DATE <= t.DATE and ((b.VALUE <= (a.OBJECTIVE)) or (b.VALUE > (a.OBJECTIVE) AND b.VALUE <= (a.OBJECTIVE + a.TOLERANCE) and a.TREND='Y')) THEN 1 ELSE 0 END) GREEN,
          sum(CASE WHEN a.START_DATE <= t.DATE and (b.VALUE > (a.OBJECTIVE) AND b.VALUE <= (a.OBJECTIVE + a.TOLERANCE) and a.TREND='N') THEN 1 ELSE 0 END) YELLOW,
          sum(CASE WHEN a.START_DATE <= t.DATE and (b.VALUE > (a.OBJECTIVE + a.TOLERANCE) and a.TREND='N') THEN 1 ELSE 0 END) RED,
          sum(CASE WHEN a.START_DATE <= t.DATE and (b.VALUE > (a.OBJECTIVE + a.TOLERANCE) and a.TREND='Y') THEN 1 ELSE 0 END) ORANGE,
          sum(case when a.START_DATE <= t.DATE and ((b.RESULT_ID is null or b.ERROR_CODE is not null) and datediff(curdate(), t.DATE) - case when ifnull(c.CYCLE_CLOSE_DAY, 0) = 0 then datediff(t.LAST_DATE, t.DATE) else ifnull(c.CYCLE_CLOSE_DAY, 0) end > ifnull(dm.DELAY,2)) then 1 else 0 end) NO_RESULT
        FROM AMX_TIME_MONTH t
        JOIN AMX_METRIC_CATALOGUE a ON 1 = 1
        JOIN AMX_BILL_CYCLE c ON c.OPCO_ID = case when a.FREQUENCY = 'C' then a.OPCO_ID else 0 end
          and (t.CALENDAR_MONTH * substr(c.CYCLE_TYPE, 2, 1) + substr(c.CYCLE_TYPE, 3, 1))%2 = 0
        left join V_DIM_METRIC dm on dm.OPCO_ID = a.OPCO_ID
          and dm.METRIC_ID = a.METRIC_ID      
          and ifnull(dm.BILL_CYCLE, 0) = ifnull(c.BILL_CYCLE, 0)
        LEFT JOIN AMX_METRIC_RESULT b ON  
          b.METRIC_ID = a.METRIC_ID AND 
          b.OPCO_ID = a.OPCO_ID AND 
          b.DATE = t.DATE AND 
          b.BILL_CYCLE = c.BILL_CYCLE
        WHERE a.FREQUENCY in ('C', 'M') 
          and a.RELEVANT = 'Y'
          and a.OPCO_ID = ?
          and t.DATE BETWEEN ? AND ? 
        GROUP BY 
          a.OPCO_ID,
          a.METRIC_ID,
          a.FREQUENCY,
          a.AREA_ID, 
          a.NAME,
          a.IMPLEMENTED    
      ) sub1
      order by AREA_ID, substr(replace(METRIC_ID, AREA_ID, '000'), -3, 3)`, 
      [req.query.opcoId, req.query.fromDate, req.query.toDate, req.query.opcoId, req.query.fromDate, req.query.toDate], 
      function(err, row) {
        if(err !== null) {
          console.log(err);
          next(err);
        }
        else {
          res.json(row);
        }
      }
    );
  }

  // Used in "Dato results overview"

  if (req.params.apiEndpoint === "getDatoResultsSummary") { 

    db.query(`select * from
      (
      select
        dc.OPCO_ID,
        dc.DATO_ID,
        dc.FREQUENCY, 
        dc.AREA_ID, 
        dc.NAME,
        sum(CASE WHEN dc.START_DATE <= t.DATE and (ifnull(dr.CNT,0) >= ifnull(dd.CNT, 1)) then 1 else 0 end) GREEN,
        sum(CASE WHEN dc.START_DATE <= t.DATE and (ifnull(dr.CNT,0) < ifnull(dd.CNT, 1) and ifnull(dr.CNT,0)>0) then 1 else 0 end) ORANGE,
        sum(CASE WHEN dc.START_DATE <= t.DATE and (ifnull(dr.CNT,0) = 0 and datediff(curdate(), t.DATE) > ifnull(dd.DELAY,2)+1) then 1 else 0 end) RED,
        sum(CASE WHEN dc.START_DATE <= t.DATE and (ifnull(dr.CNT,0) = 0 and datediff(curdate(), t.DATE) <= ifnull(dd.DELAY,2)+1)  then 1 else 0 end) NO_RESULT
      from AMX_TIME_DAY t
      join AMX_DATO_CATALOGUE dc on 1=1
      left join V_DIM_DATO dd on dd.OPCO_ID = dc.OPCO_ID
        and dd.DATO_ID = dc.DATO_ID
      left join (
          SELECT 
              b.DATE AS DATE,
              b.DATO_ID AS DATO_ID,
              b.OPCO_ID AS OPCO_ID,
              b.BILL_CYCLE AS BILL_CYCLE,
              COUNT(*) AS CNT
          FROM amx_file_dato b
              JOIN amx_dato_layout l ON (b.OPCO_ID = l.OPCO_ID)
                  AND (b.DATO_ID = l.DATO_ID)
                  AND (b.BILL_CYCLE = l.BILL_CYCLE)
                  AND (b.LOB_ID = l.LOB_ID)
                  AND (b.REGION_ID = l.REGION_ID)
                  AND (b.TECHNOLOGY_ID = l.TECHNOLOGY_ID)
                  AND (b.SERVICE_ID = l.SERVICE_ID)
                  AND (b.PERIODICITY_ID = l.PERIODICITY_ID)
          WHERE b.OPCO_ID = ?
            AND b.DATE BETWEEN ? AND ?
          GROUP BY b.DATE , b.DATO_ID , b.OPCO_ID , b.BILL_CYCLE
      ) dr on dr.DATE = t.DATE
        and dr.OPCO_ID = dc.OPCO_ID
        and dr.DATO_ID = dc.DATO_ID
        and ifnull(dr.BILL_CYCLE, 0) = ifnull(dd.BILL_CYCLE, 0)   
      where dc.FREQUENCY = 'D' 
        AND dc.RELEVANT = 'Y'
        and dc.OPCO_ID = ?
        AND t.DATE BETWEEN ? AND ?
      group by
        dc.OPCO_ID,
        dc.DATO_ID,
        dc.FREQUENCY, 
        dc.AREA_ID, 
        dc.NAME

      union 

      SELECT 
        dc.OPCO_ID,
        dc.DATO_ID,
        dc.FREQUENCY, 
        dc.AREA_ID, 
        dc.NAME,
        sum(CASE WHEN dc.START_DATE <= t.DATE and (ifnull(dr.CNT, 0) >= ifnull(dd.CNT, 1)) THEN 1 ELSE 0 END) GREEN,
        sum(CASE WHEN dc.START_DATE <= t.DATE and (ifnull(dr.CNT, 0) < ifnull(dd.CNT, 1) AND ifnull(dr.CNT, 0) > 0) THEN 1 ELSE 0 END) ORANGE,
        sum(CASE WHEN dc.START_DATE <= t.DATE and (ifnull(dr.CNT, 0) = 0 AND datediff(curdate(), t.DATE) > (ifnull(dd.DELAY, 2) + 1 + CASE WHEN ifnull(bc.CYCLE_CLOSE_DAY, 0) = 0 THEN datediff(t.LAST_DATE, t.DATE) ELSE ifnull(bc.CYCLE_CLOSE_DAY, 0) END)) THEN 1 ELSE 0 END) RED,
        sum(CASE WHEN dc.START_DATE <= t.DATE and (ifnull(dr.CNT, 0) = 0 AND datediff(curdate(), t.DATE) <= (ifnull(dd.DELAY, 2) + 1 + CASE WHEN ifnull(bc.CYCLE_CLOSE_DAY, 0) = 0 THEN datediff(t.LAST_DATE, t.DATE) ELSE ifnull(bc.CYCLE_CLOSE_DAY, 0) END)) THEN 1 ELSE 0 END) NO_RESULT
      FROM AMX_TIME_MONTH t
      JOIN AMX_DATO_CATALOGUE dc ON 1 = 1
      LEFT JOIN AMX_BILL_CYCLE bc ON bc.OPCO_ID = case when dc.FREQUENCY = 'C' then dc.OPCO_ID else 0 end
        and (t.CALENDAR_MONTH * substr(bc.CYCLE_TYPE, 2, 1) + substr(bc.CYCLE_TYPE, 3, 1))%2 = 0
      LEFT JOIN V_DIM_DATO dd ON dd.OPCO_ID = dc.OPCO_ID 
        AND dd.DATO_ID = dc.DATO_ID
        and ifnull(dd.BILL_CYCLE, 0) = ifnull(bc.BILL_CYCLE, 0)    
      LEFT JOIN (
          SELECT 
              b.DATE AS DATE,
              b.DATO_ID AS DATO_ID,
              b.OPCO_ID AS OPCO_ID,
              b.BILL_CYCLE AS BILL_CYCLE,
              COUNT(*) AS CNT
          FROM amx_file_dato b
              JOIN amx_dato_layout l ON (b.OPCO_ID = l.OPCO_ID)
                  AND (b.DATO_ID = l.DATO_ID)
                  AND (b.BILL_CYCLE = l.BILL_CYCLE)
                  AND (b.LOB_ID = l.LOB_ID)
                  AND (b.REGION_ID = l.REGION_ID)
                  AND (b.TECHNOLOGY_ID = l.TECHNOLOGY_ID)
                  AND (b.SERVICE_ID = l.SERVICE_ID)
                  AND (b.PERIODICITY_ID = l.PERIODICITY_ID)
          WHERE b.OPCO_ID = ?
            AND b.DATE BETWEEN ? AND ?
          GROUP BY b.DATE , b.DATO_ID , b.OPCO_ID , b.BILL_CYCLE
      ) dr ON dr.DATE = t.DATE 
        AND dr.OPCO_ID = dc.OPCO_ID 
        AND dr.DATO_ID = dc.DATO_ID 
        and ifnull(dr.BILL_CYCLE, 0) = ifnull(dd.BILL_CYCLE, 0)
      WHERE dc.FREQUENCY in ('C', 'M') 
        and dc.RELEVANT = 'Y'
        and dc.OPCO_ID = ?
        and t.DATE BETWEEN ? AND ? 
      GROUP BY 
        dc.OPCO_ID,
        dc.DATO_ID,
        dc.FREQUENCY, 
        dc.AREA_ID, 
        dc.NAME
      ) sub1
      order by AREA_ID, DATO_ID
      `, 
      [req.query.opcoId, req.query.fromDate, req.query.toDate, req.query.opcoId, req.query.fromDate, req.query.toDate, req.query.opcoId, req.query.fromDate, req.query.toDate, req.query.opcoId, req.query.fromDate, req.query.toDate], 
      function(err, row) {
        if(err !== null) {
          console.log(err);
          next(err);
        }
        else {
          res.json(row);
        }
    });

  }

  //Used in "Metrics results tab" - metric results table data
  if (req.params.apiEndpoint === "getMetricsForPeriod") {
    if(req.query.frequency === 'D') {
        db.query(`select
                t.DATE,
                t.DAY_OF_WEEK,
                mc.OPCO_ID,
                mc.METRIC_ID,
                mc.NAME,
                mc.FREQUENCY,
                dm.BILL_CYCLE,
                mr.CNT, 
                mr.OBJECTIVE, 
                mr.TOLERANCE, 
                mr.JSON_DATO, 
                mr.JSON_DATO_SUMS, 
                mr.FORMULA, 
                mr.FORMULA_EVAL, 
                mr.VALUE, 
                mr.ERROR_CODE,
                mr.MODIFIED,
                mr.RECALCULATE,
                mr.RESULT_ID,
                case 
                    when mr.RESULT_ID is null then datediff(curdate(), t.DATE) - ifnull(dm.DELAY,2) 
                    else datediff(curdate(), mr.MODIFIED)
                end DAYS_LATE,
                case 
                  when mr.RESULT_ID is null then getMissingDatos(mc.METRIC_ID, mc.OPCO_ID, dm.BILL_CYCLE, t.DATE)
                  else null 
                end DATO_ID_MISSING,
                a.ASSIGNED_TO,
                a.NOTE,
                a.INCIDENT_ID
          from AMX_TIME_DAY t
          join AMX_METRIC_CATALOGUE mc on 1=1
          left join V_DIM_METRIC dm on 1=1
              and dm.OPCO_ID = mc.OPCO_ID
              and dm.METRIC_ID = mc.METRIC_ID
          left join AMX_METRIC_RESULT mr on 1=1
              and mr.OPCO_ID = mc.OPCO_ID 
              and mr.METRIC_ID = mc.METRIC_ID
              and ifnull(mr.BILL_CYCLE, 0) = ifnull(dm.BILL_CYCLE, 0)
              and mr.DATE = t.DATE
          left join AMX_ALARM a on 1=1
            and a.OPCO_ID = mc.OPCO_ID
            and a.OBJECT_ID = mc.METRIC_ID
            and a.OBJECT_DATE = t.DATE
            and date(a.CREATED) = date(mr.MODIFIED)
          where t.DATE BETWEEN ? and ?
                AND mc.START_DATE <= t.DATE         
                AND mc.METRIC_ID = ? 
                AND mc.OPCO_ID = ?
          order by 1,2`, 
        [req.query.fromDate, req.query.toDate, req.query.metricId, Number(req.query.opcoId)], 
        function(err, row) {
          if(err !== null) {
            console.log(err);
            next(err);
          }
          else {
            res.json(row);
          }
      });
    }
    else if(req.query.frequency === 'C' || req.query.frequency === 'M') {
        db.query(`select
                t.DATE,
                0 DAY_OF_WEEK,
                mc.OPCO_ID,
                mc.METRIC_ID,
                mc.NAME,
                bc.BILL_CYCLE,
                mr.CNT, 
                mr.OBJECTIVE, 
                mr.TOLERANCE, 
                mr.JSON_DATO, 
                mr.JSON_DATO_SUMS, 
                mr.FORMULA, 
                mr.FORMULA_EVAL, 
                mr.VALUE, 
                mr.ERROR_CODE,
                mr.MODIFIED,
                mr.RECALCULATE,
                mr.RESULT_ID,
                case 
                    when mr.RESULT_ID is null then datediff(curdate(), t.DATE) - ifnull(dm.DELAY,2) - case when ifnull(bc.CYCLE_CLOSE_DAY, 0) = 0 then datediff(t.LAST_DATE, t.DATE) else ifnull(bc.CYCLE_CLOSE_DAY, 0) end 
                    else datediff(curdate(), mr.MODIFIED)
                end DAYS_LATE,
                case 
                  when mr.RESULT_ID is null then getMissingDatos(mc.METRIC_ID, mc.OPCO_ID, dm.BILL_CYCLE, t.DATE)
                  else null 
                end DATO_ID_MISSING,
                a.ASSIGNED_TO,
                a.NOTE,
                a.INCIDENT_ID                       
          from AMX_TIME_MONTH t
          join AMX_METRIC_CATALOGUE mc on 1=1
          join AMX_BILL_CYCLE bc on 1=1 
              and bc.OPCO_ID = case when mc.FREQUENCY='C' then mc.OPCO_ID else 0 end
              and (t.CALENDAR_MONTH * substr(bc.CYCLE_TYPE, 2, 1) + substr(bc.CYCLE_TYPE, 3, 1))%2 = 0
          left join V_DIM_METRIC dm on 1=1
              and dm.OPCO_ID = mc.OPCO_ID
              and dm.METRIC_ID = mc.METRIC_ID
              and ifnull(dm.BILL_CYCLE, 0) = ifnull(bc.BILL_CYCLE, 0)
          left join AMX_METRIC_RESULT mr on 1=1
              and mr.OPCO_ID = mc.OPCO_ID 
              and mr.METRIC_ID = mc.METRIC_ID
              and ifnull(mr.BILL_CYCLE, 0) = ifnull(dm.BILL_CYCLE, 0)
              and mr.DATE = t.DATE
          left join AMX_ALARM a on 1=1
            and a.OPCO_ID = mc.OPCO_ID
            and a.OBJECT_ID = mc.METRIC_ID
            and a.OBJECT_DATE = t.DATE     
            and a.OBJECT_VERSION = dm.BILL_CYCLE
            and date(a.CREATED) = date(mr.MODIFIED)                   
          where t.DATE BETWEEN ? and ?
                AND mc.START_DATE <= t.DATE          
                AND mc.METRIC_ID = ? 
                AND mc.OPCO_ID = ?
          order by 1,2`, 
        [req.query.fromDate, req.query.toDate, req.query.metricId, Number(req.query.opcoId)], 
        function(err, row) {
          if(err !== null) {
            console.log(err);
            next(err);
          }
          else {
            res.json(row);
          }
      });
    }
  }

  if (req.params.apiEndpoint === "getAllMetricsForPeriod") {
    if(req.query.frequency === 'D') {
        db.query(`select
                t.DATE,
                t.DAY_OF_WEEK,
                mc.OPCO_ID,
                mc.METRIC_ID,
                mc.NAME,
                mc.FREQUENCY,
                dm.BILL_CYCLE,
                mr.CNT, 
                mc.OBJECTIVE, 
                mc.TOLERANCE, 
                mc.START_DATE,
                mr.FORMULA, 
                mr.FORMULA_EVAL, 
                case when 
                  mc.START_DATE > t.DATE then null 
                  else mr.VALUE
                end VALUE, 
                mr.ERROR_CODE,
                mr.MODIFIED,
                mr.RESULT_ID,
                mc.RELEVANT,
                mc.IMPLEMENTED,
                mc.TREND,
                case 
                    when mr.RESULT_ID is null then datediff(curdate(), t.DATE) - ifnull(dm.DELAY,2) 
                    else datediff(curdate(), mr.MODIFIED)
                end DAYS_LATE,
                case 
                  when mr.RESULT_ID is null then getMissingDatos(mc.METRIC_ID, mc.OPCO_ID, dm.BILL_CYCLE, t.DATE)
                  else null 
                end DATO_ID_MISSING 
          from AMX_TIME_DAY t
          join AMX_METRIC_CATALOGUE mc on 1=1
          left join V_DIM_METRIC dm on 1=1
              and dm.OPCO_ID = mc.OPCO_ID
              and dm.METRIC_ID = mc.METRIC_ID
          left join AMX_METRIC_RESULT mr on 1=1
              and mr.OPCO_ID = mc.OPCO_ID 
              and mr.METRIC_ID = mc.METRIC_ID
              and ifnull(mr.BILL_CYCLE, 0) = ifnull(dm.BILL_CYCLE, 0)
              and mr.DATE = t.DATE
          where t.DATE BETWEEN ? and ?
                AND mc.OPCO_ID = ?
                AND mc.IMPLEMENTED like ? 
                AND mc.FREQUENCY = 'D' 
                AND mc.RELEVANT = 'Y' 
          order by 1,2,mc.AREA_ID, substr(replace(mc.METRIC_ID, mc.AREA_ID, '000'), -3, 3)`, 
        [req.query.fromDate, req.query.toDate, Number(req.query.opcoId), (req.query.finetuned === 'Y'?'Y':'%')], 
        function(err, row) {
          if(err !== null) {
            console.log(err);
            next(err);
          }
          else {
            res.json(row);
          }
      });
    }
    else if(req.query.frequency === 'C' || req.query.frequency === 'M') {
        db.query(`select
                t.DATE,
                0 DAY_OF_WEEK,
                mc.OPCO_ID,
                mc.METRIC_ID,
                mc.NAME,
                bc.BILL_CYCLE,
                concat(mc.METRIC_ID, '_', bc.BILL_CYCLE) MC_KEY,
                mr.CNT, 
                mc.OBJECTIVE, 
                mc.TOLERANCE, 
                mc.START_DATE,
                mr.FORMULA, 
                mr.FORMULA_EVAL, 
                case when 
                  mc.START_DATE > t.DATE then null 
                  else mr.VALUE
                end VALUE, 
                mr.ERROR_CODE,
                mr.MODIFIED,
                mr.RESULT_ID,
                mc.RELEVANT,
                mc.IMPLEMENTED,
                mc.TREND,
                case 
                    when (t.CALENDAR_MONTH * substr(bc.CYCLE_TYPE, 2, 1) + substr(bc.CYCLE_TYPE, 3, 1))%2 != 0 then 0
                    when mr.RESULT_ID is null then datediff(curdate(), t.DATE) - ifnull(dm.DELAY,2) - case when ifnull(bc.CYCLE_CLOSE_DAY, 0) = 0 then datediff(t.LAST_DATE, t.DATE) else ifnull(bc.CYCLE_CLOSE_DAY, 0) end 
                    else datediff(curdate(), mr.MODIFIED)
                end DAYS_LATE,
                case 
                  when mr.RESULT_ID is null then getMissingDatos(mc.METRIC_ID, mc.OPCO_ID, dm.BILL_CYCLE, t.DATE)
                  else null 
                end DATO_ID_MISSING                       
          from AMX_TIME_MONTH t
          join AMX_METRIC_CATALOGUE mc on 1=1
          join AMX_BILL_CYCLE bc on 1=1 
              and bc.OPCO_ID = case when mc.FREQUENCY='C' then mc.OPCO_ID else 0 end
          left join V_DIM_METRIC dm on 1=1
              and dm.OPCO_ID = mc.OPCO_ID
              and dm.METRIC_ID = mc.METRIC_ID
              and ifnull(dm.BILL_CYCLE, 0) = ifnull(bc.BILL_CYCLE, 0)
          left join AMX_METRIC_RESULT mr on 1=1
              and mr.OPCO_ID = mc.OPCO_ID 
              and mr.METRIC_ID = mc.METRIC_ID
              and ifnull(mr.BILL_CYCLE, 0) = ifnull(dm.BILL_CYCLE, 0)
              and mr.DATE = t.DATE
          where t.DATE BETWEEN ? and ?
                AND mc.OPCO_ID = ?
                AND mc.IMPLEMENTED like ? 
                AND mc.FREQUENCY in ('M', 'C')
                AND mc.RELEVANT = 'Y'
          order by 1,2`, 
        [req.query.fromDate, req.query.toDate, Number(req.query.opcoId), (req.query.finetuned === 'Y'?'Y':'%')],  
        function(err, row) {
          if(err !== null) {
            console.log(err);
            next(err);
          }
          else {
            res.json(row);
          }
      });
    }
  }

/*
*
*
*
*
* Datos
*
*/

  // Used in "Dato results tab" - Dato results table data

  if (req.params.apiEndpoint === "getDatosForPeriod") {
    if(req.query.frequency === 'D') {
        db.query(`select
              t.DATE,
              t.DAY_OF_WEEK,
              dc.DATO_ID,
              ifnull(dd.CNT,1) CNT,
              ifnull(dl.DELAY,2) DELAY,
              ifnull(sys.NAME, 'N/A') SYSTEM_NAME,
              lob.LOB_ID,
              ifnull(lob.NAME, 'N/A') LOB_NAME,
              tec.TECHNOLOGY_ID,
              ifnull(tec.NAME, 'N/A') TECHNOLOGY_NAME,
              ser.SERVICE_ID,
              ifnull(ser.NAME, 'N/A') SERVICE_NAME,
              dl.PERIODICITY_ID,
              ifnull(d.BILL_CYCLE,0) BILL_CYCLE,
              d.VALUE,
              case 
                  when d.FILE_ID is null then datediff(curdate(), t.DATE) - ifnull(dl.DELAY,2) 
                  else datediff(f.FILE_HEADER_DATE, t.DATE) - ifnull(dl.DELAY,2) 
              end DAYS_LATE,
              d.FILE_ROWNUM,
              f.FILE_ID,
              f.FILE_NAME,
              f.FILE_HEADER_DATE FILE_DATE,
              f.CREATED
          from AMX_TIME_DAY t
          join AMX_DATO_CATALOGUE dc on 1=1
          left join V_DIM_DATO dd on 1=1
              and dd.OPCO_ID = dc.OPCO_ID
              and dd.DATO_ID = dc.DATO_ID
              and dd.FREQUENCY = dc.FREQUENCY
          left join AMX_DATO_LAYOUT dl on 1=1
              and dl.OPCO_ID = dc.OPCO_ID
              and dl.DATO_ID = dc.DATO_ID
              and case when dl.PERIODICITY_ID = 1 then '01' else substr(t.DATE, -2, 2) end = '01'
          left join AMX_SYSTEM sys on sys.SYSTEM_ID = dl.SYSTEM_ID
          left join AMX_LOB lob on lob.LOB_ID = dl.LOB_ID
          left join AMX_TECHNOLOGY tec on tec.TECHNOLOGY_ID = dl.TECHNOLOGY_ID
          left join AMX_SERVICE ser on ser.SERVICE_ID = dl.SERVICE_ID
          left join AMX_FILE_DATO d on 1=1
              and d.OPCO_ID = dl.OPCO_ID 
              and d.DATO_ID = dl.DATO_ID
              and d.LOB_ID = dl.LOB_ID
              and d.REGION_ID = dl.REGION_ID
              and d.TECHNOLOGY_ID = dl.TECHNOLOGY_ID
              and d.SERVICE_ID = dl.SERVICE_ID
              and d.PERIODICITY_ID = dl.PERIODICITY_ID
              and d.DATE = t.DATE
          left join AMX_FILE_LOG f on f.FILE_ID = d.FILE_ID
              where t.DATE BETWEEN ? and ?
                AND dc.DATO_ID = ? 
                AND dc.OPCO_ID = ?
          order by 1,2,6,8,10`, 
        [req.query.fromDate, req.query.toDate, req.query.datoId, Number(req.query.opcoId)], 
        function(err, row) {
          if(err !== null) {
            console.log(err);
            next(err);
          }
          else {
            res.json(row);
          }
      });
    }
    else if (req.query.frequency === 'C' || req.query.frequency === 'M') {
        db.query(`select
              t.DATE,
              0 DAY_OF_WEEK,
              dc.DATO_ID,
              1 CNT,
              ifnull(dl.DELAY,2) DELAY,
              ifnull(sys.NAME, 'N/A') SYSTEM_NAME,
              lob.LOB_ID,
              ifnull(lob.NAME, 'N/A') LOB_NAME,
              tec.TECHNOLOGY_ID,
              ifnull(tec.NAME, 'N/A') TECHNOLOGY_NAME,
              ser.SERVICE_ID,
              ifnull(ser.NAME, 'N/A') SERVICE_NAME,
              dl.PERIODICITY_ID,
              ifnull(bc.BILL_CYCLE,0) BILL_CYCLE,
              case 
                  when d.FILE_ID is null then datediff(curdate(), t.DATE) - ifnull(dl.DELAY,2) - case when ifnull(bc.CYCLE_CLOSE_DAY, 0) = 0 then datediff(t.LAST_DATE, t.DATE) else ifnull(bc.CYCLE_CLOSE_DAY, 0) end 
                  else datediff(f.FILE_HEADER_DATE, t.DATE) - ifnull(dl.DELAY,2) - case when ifnull(bc.CYCLE_CLOSE_DAY, 0) = 0 then datediff(t.LAST_DATE, t.DATE) else ifnull(bc.CYCLE_CLOSE_DAY, 0) end 
              end DAYS_LATE,
              d.VALUE,
              d.FILE_ROWNUM,
              f.FILE_ID,
              f.FILE_NAME,
              f.FILE_HEADER_DATE FILE_DATE,
              f.CREATED
          from AMX_TIME_MONTH t
          join AMX_DATO_CATALOGUE dc on 1=1
          join AMX_BILL_CYCLE bc on 1=1
              and bc.OPCO_ID = case when dc.FREQUENCY='C' then dc.OPCO_ID else 0 end
              and (t.CALENDAR_MONTH * substr(bc.CYCLE_TYPE, 2, 1) + substr(bc.CYCLE_TYPE, 3, 1))%2 = 0
          left join AMX_DATO_LAYOUT dl on 1=1
              and dl.OPCO_ID = dc.OPCO_ID
              and dl.DATO_ID = dc.DATO_ID
              and ifnull(dl.BILL_CYCLE, 0) = ifnull(bc.BILL_CYCLE, 0)
          left join AMX_SYSTEM sys on sys.SYSTEM_ID = dl.SYSTEM_ID
          left join AMX_LOB lob on lob.LOB_ID = dl.LOB_ID
          left join AMX_TECHNOLOGY tec on tec.TECHNOLOGY_ID = dl.TECHNOLOGY_ID
          left join AMX_SERVICE ser on ser.SERVICE_ID = dl.SERVICE_ID
          left join AMX_FILE_DATO d on 1=1
              and d.DATE = t.DATE
              and d.OPCO_ID = dl.OPCO_ID 
              and d.DATO_ID = dl.DATO_ID
              and d.LOB_ID = dl.LOB_ID
              and d.REGION_ID = dl.REGION_ID
              and d.TECHNOLOGY_ID = dl.TECHNOLOGY_ID
              and d.SERVICE_ID = dl.SERVICE_ID
              and d.PERIODICITY_ID = dl.PERIODICITY_ID
              and ifnull(d.BILL_CYCLE, 0) = ifnull(dl.BILL_CYCLE, 0)
          left join AMX_FILE_LOG f on f.FILE_ID = d.FILE_ID
          where t.DATE BETWEEN ? and ?
              and dc.DATO_ID = ? 
              and dc.OPCO_ID = ?
          order by 1,2,6,8,10`, 
        [req.query.fromDate, req.query.toDate, req.query.datoId, Number(req.query.opcoId)], 
        function(err, row) {
          if(err !== null) {
            console.log(err);
            next(err);
          }
          else {
            res.json(row);
          }
        });
    }
  }


  if (req.params.apiEndpoint === "getReglasFile") {  
      db.query(`SELECT
              DATO_ID ID_DATO_IN,
              DELAY DIAS_DESFASE_IN,
              LOB_ID ID_LINEANEGOCIO_IN,
              REGION_ID ID_REGION_IN,
              PERIODICITY_ID ID_PERIODO_IN,
              TECHNOLOGY_ID ID_TECNOLOGIA_IN,
              SERVICE_ID ID_SERVICIO_IN
            FROM amx_dato_layout  
            where OPCO_ID = ?
            order by 1`, 
      [Number(req.query.opcoId)], 
      function(err, row) {
        if(err !== null) {
          console.log(err);
          next(err);
        }
        else {
          res.json(row);
        }
      });
  }

  if (req.params.apiEndpoint === "getFinetuneStatusFile") {  
      db.query(`
              select 
                a.OPCO_ID,
                b.COUNTRY,
                b.OPCO_NAME,    
                a.METRIC_ID,
                a.RELEVANT,
                a.NAME,
                a.DESCRIPTION,
                a.FREQUENCY,
                a.FORMULA,
                a.OBJECTIVE,
                a.TOLERANCE,
                case 
                  when t.TASK_STATUS is null then 'No tasks'
                    else t.TASK_STATUS
                end TASK_STATUS,
                case 
                    when RELEVANT = 'N' then 'Not relevant' 
                    when IMPLEMENTED = 'Y' then 'Fine-tuned' 
                    when IMPLEMENTED = 'N' and length(a.NOTES) > 0 then 'In fine-tuning' 
                    else 'Not ready'
                end STATUS,
                t.NOTES "TASK_DESCRIPTION / NOTES"
            from AMX_METRIC_CATALOGUE a
            join AMX_OPCO b on b.OPCO_ID = a.OPCO_ID
            left join v_task_summary t on t.OPCO_ID = a.OPCO_ID and t.OBJECT_ID = a.METRIC_ID
            where  a.OPCO_ID = ?
            `, 
      [Number(req.query.opcoId)], 
      function(err, row) {
        if(err !== null) {
          console.log(err);
          next(err);
        }
        else {
          res.json(row);
        }
      });
  }  
}
