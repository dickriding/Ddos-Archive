<!--
 _   __                          _ 
| | / /                         | |
| |/ /  ___  _ __  _ __ __ _  __| |
|    \ / _ \| '_ \| '__/ _` |/ _` |
| |\  \ (_) | | | | | | (_| | (_| |
\_| \_/\___/|_| |_|_|  \__,_|\__,_|
-->
<?php
session_start();
require 'config/config.php';
if ($num == 'EU'){
	if($lang == 'FR'){
			$datareturn = 'Octets';

	}else{
			$datareturn = 'Bytes';

	}
}else{
 $datareturn = 'Bit';
}
if($lang == 'FR'){
	$requestreturn = 'Requetes';
	$phrase = 'par seconde';
}else{
	$requestreturn = 'Requests';
	$phrase = 'per second';

}
?>
<title><?php echo $sitename;?></title>
<center>
<html>
    <head>
<script src="js/jquery.min.js"></script>
<?php if($lang == 'FR'){?>

<script src="js/highcharts-fr.js"></script>
<script src="js/exporting-fr.js"></script>

<?php }else{?>

<script src="js/highcharts-en.js"></script>
<script src="js/exporting-en.js"></script>

<?php }?>

        <?php error_log(" \r\n",3,'data/layer7-logs'); ?>
		
        <script id="source" language="javascript" type="text/javascript">
$(document).ready(function() {
	
	Highcharts.createElement('link', {
   href: 'https://fonts.googleapis.com/css?family=Unica+One',
   rel: 'stylesheet',
   type: 'text/css'
}, null, document.getElementsByTagName('head')[0]);
    
    chart2 = new Highcharts.Chart({
        chart: {
            renderTo: 'container2',
            defaultSeriesType: 'spline',
            events: {
                load: requestData2
            }
        },
        title: {
            text: 'Layer 4 ==>46.166.185.62 PORT 80 <=='
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150,
            maxZoom: 20 * 1000
        },
        yAxis: {
            minPadding: 0.2,
            maxPadding: 0.2,
            title: {
                text: '<?php echo $datareturn;?> <?php echo $phrase;?>',
                margin: 80
            }
        },
        series: [{
            name: '<?php echo $datareturn;?>/s',
            data: []
        }]
    });        
});
 
function requestData2() {
    $.ajax({
        url: 'data/layer4.php',
        success: function(point) {
            var series = chart2.series[0],
                shift = series.data.length > 20;
            chart2.series[0].addPoint(point, true, shift);
            setTimeout(requestData2, 1000);    
        },
        cache: false
    });
}
    </script>

		
		
    </head>
    <body>
    <div id="container"></div><br>
	<div id="container2"></div><br>
</html>
