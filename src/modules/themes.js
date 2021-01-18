import { cerPalette } from "./util.js";
export const generalTheme = () => {
  Highcharts.transportation = {
    chart: {
      borderColor: "black",
      animation: true,
    },

    plotOptions: {
      column: {
        stacking: "normal",
      },
      area: {
        stacking: "normal",
        marker: false,
        dataLabels: {
          enabled: false,
        },
      },
    },

    xAxis: {
      title: {
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
          fontWeight: "bold",
          fontFamily: "Arial",
        },
      },
      labels: {
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
        },
      },
      plotBands: {
        color: cerPalette["Forecast"],
        label: {
          align: "center",
          style: {
            fontWeight: "bold",
            color: cerPalette["Cool Grey"],
          },
        },
      },
    },

    yAxis: {
      title: {
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
          fontWeight: "bold",
          fontFamily: "Arial",
        },
      },
      labels: {
        formatter: function () {
          return Highcharts.numberFormat(this.value, 0, ".", ",");
        },
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
        },
      },
      stackLabels: {
        style: {
          fontWeight: "bold",
          color: (Highcharts.theme && Highcharts.theme.textColor) || "grey",
        },
      },
    },

    noData: {
      style: {
        fontWeight: "bold",
        fontSize: "15px",
        color: "#303030",
      },
    },

    title: {
      text: "",
    },
  };

  Highcharts.setOptions(Highcharts.transportation);
};
