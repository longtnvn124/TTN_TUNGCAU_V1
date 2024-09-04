import { ApexAxisChartSeries , ApexChart , ApexTitleSubtitle , ApexXAxis , ChartComponent , ApexAnnotations , ApexFill , ApexNonAxisChartSeries , ApexStroke , ApexTooltip } from 'ng-apexcharts';

export type ChartOptions = {
	series : ApexAxisChartSeries | ApexNonAxisChartSeries;
	chart : ApexChart;
	xaxis : ApexXAxis;
	title? : ApexTitleSubtitle;
	tooltip? : ApexTooltip;
	annotations? : ApexAnnotations;
	loading? : boolean;
	stroke? : ApexStroke;
	fill? : ApexFill;
};
