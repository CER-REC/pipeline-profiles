import { summaryParagraph } from "./summary.js";
import { visibility } from "../modules/util.js";
import { EventMap, EventNavigator, EventTrend } from "../modules/dashboard.js";

export const mainIncidents = (incidentData, metaData) => {
  // populates the paragraph right above the dashboard with some company specific stats
  summaryParagraph(metaData);
  const incidentBar = (data, map) => {
    const barNav = new EventNavigator(map, undefined, [], {}, 125);
    barNav.prepareData(data);
    barNav.makeBar("Substance", "substance-bar", "activated", true);
    barNav.makeBar("Status", "status-bar", "deactivated", true);
    barNav.makeBar("Province", "province-bar", "deactivated", true);
    barNav.makeBar("Year", "year-bar", "deactivated", true);
    barNav.divEvents();
    return barNav;
  };

  const field = "Substance";
  const filters = { type: "frequency" };

  const incidentMap = (field, filters) => {
    const minRadius = 14000;
    const map = new EventMap("incidents", field, filters, minRadius);
    map.addBaseMap();
    map.processEventsData(incidentData);
    map.lookForSize();
    return map;
  };

  const incidentTimeSeries = (field, filters) => {
    const timeSeries = new EventTrend(
      "incidents",
      field,
      filters,
      incidentData,
      "time-series"
    );

    const trendNav = new EventNavigator(timeSeries, undefined, [], {}, 125);
    try {
      trendNav.makeBar("Substance", "substance-trend", "activated", false);
      trendNav.makeBar("Status", "status-trend", "deactivated", false);
      trendNav.makeBar("Province", "province-trend", "deactivated", false);
      // trendNav.makeBar("What Happened", "what-trend", "deactivated", false);
      trendNav.divEvents();
    } catch (err) {
      console.log(err);
    }

    timeSeries.createChart();
    return timeSeries;
  };

  const thisMap = incidentMap(field, filters);
  const bars = incidentBar(incidentData, thisMap);
  const trends = incidentTimeSeries(field, filters);
  //add the time series to last button

  // user selection to show volume or incident frequency
  $("#incident-data-type button").on("click", function () {
    $(".btn-incident-data-type > .btn").removeClass("active");
    $(this).addClass("active");
    var thisBtn = $(this);
    var btnValue = thisBtn.val();
    if (btnValue !== "trends") {
      // update map radius for volume
      thisMap.filters.type = btnValue;
      trends.filters.type = btnValue;
      bars.switchY(btnValue);
      thisMap.updateRadius();
      trends.updateRadius();
    }
  });

  // user selection to show map or trends
  $("#incident-view-type button").on("click", function () {
    $(".btn-incident-view-type > .btn").removeClass("active");
    $(this).addClass("active");
    var thisBtn = $(this);
    var btnValue = thisBtn.val();
    var dashboardDivs = ["incident-map", "nearby-incidents-popup"].concat(
      bars.allDivs
    );
    if (btnValue !== "trends") {
      visibility(dashboardDivs, "show");
      visibility(["time-series-section"], "hide");
    } else {
      visibility(dashboardDivs, "hide");
      visibility(["time-series-section"], "show");
    }
  });

  // user selection for finding nearby incidents
  $("#incident-range-slide").on("change", function () {
    let slide = $(this);
    let findIncidentBtn = document.getElementById("find-incidents-btn");
    let findIncidentTitle = document.getElementById("find-incidents-title");
    findIncidentBtn.innerText = `Find Incidents within ${slide.val()}km`;
    findIncidentTitle.innerText = `Select Range (${slide.val()}km):`;
    findIncidentBtn.value = slide.val();
  });

  // user selects a range to find nearby incidents
  $("#find-incidents-btn").on("click", function () {
    document.getElementById("reset-incidents-btn").disabled = false;
    let range = document.getElementById("find-incidents-btn").value;
    if (!thisMap.user.latitude && !thisMap.user.longitude) {
      thisMap.waitOnUser().then((userAdded) => {
        thisMap.nearbyIncidents(range);
      });
    } else {
      thisMap.nearbyIncidents(range);
    }
  });

  // reset map after user has selected a range
  $("#reset-incidents-btn").on("click", function () {
    thisMap.resetMap();
    document.getElementById("reset-incidents-btn").disabled = true;
    document.getElementById("nearby-flag").innerHTML = ``;
  });
};
