<!DOCTYPE html>
<html lang="en" style="background-color:rgb(0,0,0);">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ANACHAKHACKER.COM | Layer7 Dstat</title>

    <script type="text/javascript" src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
    <script type="text/javascript" src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>

    <script src="highcharts.js"></script>
    <script src="exporting.js"></script>

    <script language="JavaScript">
        $(function() {
            var mychart;
            var previous = null;
            var count = 0;
            var extra = [
                'L7 GRAPH (BY ANACHAKHACKER) - HIT >> http://46.166.185.62/ on port 8080 <<',
                'Requests Per Second of 46.166.185.62',
                '# Requests', 
            ];

            $(window).load(function(){
                initiateChart("container");
                parseFile();
            });

            function parseFile()
            {
                $.ajax({
                    url: "http://46.166.185.62:8080/nginx_status.html",
                    dataType: "text",
                    cache: false
                })
                .done(function(data) {
                    var current = 0;
                    var part = data.split(' ')[9];
                    var series = mychart.series[0],
                    current = parseInt(part);
                    shift = series.data.length > 40; 
                    if (previous !== null) {                        
                        series.addPoint(
                            [Math.floor($.now()), 
                                current-previous
                            ],
                            true, 
                            shift
                        );
                    }
                    previous = current;
                    count++;
                    // call it again after one second
                    setTimeout(parseFile, 1000); 

                })
                .fail(function( jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                });
            }

            function initiateChart(divid)
            {
                Highcharts.createElement('link', {
                   href: '//fonts.googleapis.com/css?family=Unica+One',
                   rel: 'stylesheet',
                   type: 'text/css'
                }, null, document.getElementsByTagName('head')[0]);
                
                var options = {
                    colors: ["#FF00FF", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
                    chart: {
                        zoomType: 'x',
                        renderTo: divid,
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                            stops: [
                                [0, '#2a2a2b'],
                                [1, '#3e3e40']
                            ]
                        },
                        style: {
                            fontFamily: "'Unica One', sans-serif"
                        },
                        plotBorderColor: '#606063'
                    },
                    title: {
                        text: extra[0],
                        style: {
                            color: '#E0E0E3',
                            textTransform: 'uppercase',
                            fontSize: '20px'
                        }
                    },
                    subtitle: {
                        text: extra[1],
                        style: {
                            color: '#E0E0E3',
                            textTransform: 'uppercase'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        style: {
                            color: '#F0F0F0'
                        },
                        crosshairs: [
                            {
                                width: 1,
                                color: '#A5A5A5'
                            },
                            {
                                width: 1,
                                color: '#A5A5A5'
                            }
                        ]
                    },
                    plotOptions: {
                        series: {
                            dataLabels: {
                                color: '#B0B0B3'
                            },
                            marker: {
                                lineColor: '#333'
                            }
                        },
                        boxplot: {
                            fillColor: '#505053'
                        },
                        candlestick: {
                            lineColor: 'white'
                        },
                        errorbar: {
                            color: 'white'
                        },
                        area: {
                            fillColor: {
                                linearGradient: {
                                    x1: 0,
                                    y1: 0,
                                    x2: 0,
                                    y2: 1
                                },
                                stops: [
                                    [0, '#FF00FF'],
                                    [1, Highcharts.Color('#FF00FF').setOpacity(0).get('rgba')]
                                ]
                            },
                            marker: {
                                radius: 2
                            },
                            lineWidth: 1,
                            states: {
                                hover: {
                                    lineWidth: 1
                                }
                            },
                            threshold: null
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    credits: {
                        style: {
                            color: '#666'
                        }
                    },
                    labels: {
                        style: {
                            color: '#707073'
                        }
                    },
                    drilldown: {
                        activeAxisLabelStyle: {
                            color: '#F0F0F3'
                        },
                        activeDataLabelStyle: {
                            color: '#F0F0F3'
                        }
                    },
                    navigation: {
                        buttonOptions: {
                            symbolStroke: '#DDDDDD',
                            theme: {
                                fill: '#505053'
                            }
                        }
                    },
                    rangeSelector: {
                        buttonTheme: {
                            fill: '#505053',
                            stroke: '#000000',
                            style: {
                                color: '#CCC'
                            },
                            states: {
                                hover: {
                                    fill: '#707073',
                                    stroke: '#000000',
                                    style: {
                                        color: 'white'
                                    }
                                },
                                select: {
                                    fill: '#000003',
                                    stroke: '#000000',
                                    style: {
                                        color: 'white'
                                    }
                                }
                            }
                        },
                        inputBoxBorderColor: '#505053',
                        inputStyle: {
                            backgroundColor: '#333',
                            color: 'silver'
                        },
                        labelStyle: {
                            color: 'silver'
                        }
                    },
                    navigator: {
                        handles: {
                            backgroundColor: '#666',
                            borderColor: '#AAA'
                        },
                        outlineColor: '#CCC',
                        maskFill: 'rgba(255,255,255,0.1)',
                        series: {
                            color: '#7798BF',
                            lineColor: '#A6C7ED'
                        },
                        xAxis: {
                            gridLineColor: '#505053'
                        }
                    },
                    scrollbar: {
                        barBackgroundColor: '#808083',
                        barBorderColor: '#808083',
                        buttonArrowColor: '#CCC',
                        buttonBackgroundColor: '#606063',
                        buttonBorderColor: '#606063',
                        rifleColor: '#FFF',
                        trackBackgroundColor: '#404043',
                        trackBorderColor: '#404043'
                    },

                    legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
                    background2: '#505053',
                    dataLabelsColor: '#B0B0B3',
                    textColor: '#C0C0C0',
                    contrastTextColor: '#F0F0F3',
                    maskColor: 'rgba(255,255,255,0.3)',
                    yAxis: {
                        gridLineColor: '#707073',
                        labels: {
                            style: {
                                color: '#E0E0E3'
                            }
                        },
                        lineColor: '#707073',
                        minorGridLineColor: '#505053',
                        tickColor: '#707073',
                        tickWidth: 1,
                        title: {
                            text: extra[2],
                            style: {
                                color: '#A0A0A3'
                            }
                        }
                    },

                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            day: '%a'
                        },
                        gridLineColor: '#707073',
                        labels: {
                            style: {
                                color: '#E0E0E3'
                            }
                        },
                        lineColor: '#707073',
                        minorGridLineColor: '#505053',
                        tickColor: '#707073',
                        title: {
                            style: {
                                color: '#A0A0A3'
                            }
                        }
                    },

                    series: [{
                        type: 'area',
                        name: 'Total Requests',
                        data: []
                    }]
                };

                mychart = new Highcharts.Chart(options);
                
                
            }

        });
    </script>
<style type="text/css" media="screen">
a:link { color:#ffffff; text-decoration: none; }
a:visited { color:#ffffff; text-decoration: none; }
a:hover { color:#ffffff; text-decoration: none; }
a:active { color:#ffffff; text-decoration: underline; }
</style>

    </head>
    <body>
<center>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-54839441-1', 'auto');
  ga('send', 'pageview');

</script>

        <div id="container" style="width: 1000px; height: 500px; margin: 0 auto; margin-top: 15px;"></div>

		


<br>
<font color="white">ลง plugin ก่อนใช้ graph ด้วยนะ<br>
Google Chrome with Cors Toggle installed plugin, download it here: <a target="_blank" href="https://chrome.google.com/webstore/detail/cors-toggle/omcncfnpmcabckcddookmnajignpffnh/related?hl=it">DOWNLOAD</a></font>
<br>
<font color="white">
Firefox with Cors Everywhere installed plugin, download it here: <a target="_blank" href="https://addons.mozilla.org/cs/firefox/addon/cors-everywhere/?src=userprofile">DOWNLOAD</a>
<br>
<font color="white">
Internet Explorer with enabled Allow-Control-Allow-Origin function: <a target="_blank" href="http://oi64.tinypic.com/293gbo4.jpg">CLICK HERE</a>
<br>
<br>
<MARQUEE WIDTH="20px" direction="right"><font color="red">>></font></MARQUEE>
<font color="white">ยิง http://46.166.185.62/</font>
<MARQUEE WIDTH="20px" direction="left"><font color="red"><<</font></MARQUEE>
<br>
<br>
<font color="red">คำเตือน : <font color="white">graph เป็นแบบ public นะขอให้ยิงแค่ 10-30 วินาทีพอ</font></font>
</center>
		
    </body>
</html>


