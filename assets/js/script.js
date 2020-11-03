$(document).ready(function()
{
    //Pulls weather data from default location to populate page
    pullWeatherData("Minneapolis", false);
    setDayTitle();

    //Converts kevlin to fahrenheit and rounds to given decimal place
    function kelvinToFahrenheit(temp, decimal)
    {
        let tempInt = parseInt(temp);
        let fTemp = ((tempInt - 273.15)*9/5 + 32).toFixed(decimal);

        return fTemp;
    }

    //Creates a new location shortcut if the shortcut has not already been created, sets shortcut to appear as active color
    function createLocationButton(location)
    {
        let existingButton = false;
        resetActiveButton();

        $("button").each(function()
        {
        if ($(this).attr("data-location") === location)
        {
            $(this).addClass("active");
            existingButton = true;
        }
        })

        if (!existingButton)
        {
        let newBtn = $("<button>");
        newBtn.attr("type", "button");
        newBtn.addClass("list-group-item list-group-item-action location-button active");
        newBtn.text(location);
        newBtn.attr("data-location", location);
        $("#location-buttons").prepend(newBtn);
        }
    }

    //Clears active class from location shortcut buttons to avoid multiple buttons showing as active
    function resetActiveButton()
    {
        $("button").each(function()
        {
        $(this).removeClass("active");
        })
    }

    //Gets day from moment.js and adds to it to fill out the week
    function setDayTitle()
    {
        $("#day0").text(moment().format("dddd"));
        $("#day1").text(moment().add(1, 'd').format("dddd"));
        $("#day2").text(moment().add(2, 'd').format("dddd"));
        $("#day3").text(moment().add(3, 'd').format("dddd"));
        $("#day4").text(moment().add(4, 'd').format("dddd"));
        $("#day5").text(moment().add(5, 'd').format("dddd"));
    }

    //Gets cardinal direction from wind degrees
    function windDirection(degreesString)
    {
        let direction = "";
        let degrees = parseInt(degreesString);

        if (degrees < 22.5 || degrees > 337.5)
        {
        direction = "N"; 
        }
        else if (degrees >= 22.5 || degrees <= 67.5)
        {
        direction = "NE"; 
        }
        else if (degrees > 67.5 || degrees <= 112.5)
        {
        direction = "E"; 
        }
        else if (degrees > 112.5 || degrees <= 157.5)
        {
        direction = "SE"; 
        }
        else if (degrees > 157.5 || degrees <= 202.5)
        {
        direction = "S"; 
        }
        else if (degrees > 202.5 || degrees <= 247.5)
        {
        direction = "SW"; 
        }
        else if (degrees > 247.5 || degrees <= 295.5)
        {
        direction = "W"; 
        }
        else if (degrees > 295.5 || degrees <= 337.5)
        {
        direction = "W"; 
        }

        return direction;
    }

    //Pulls weather data from openweather api, uses current weather api for some info, then passes latitude and longitude
    //into one call api for rest of information
    //Calls button create function if necesarry
    function pullWeatherData(location, newBtn)
    {
        let params = 
        {
        q: location,
        cnt: 5,
        appid: "87cd2f3bae194c48a4c4081e9ab09c49"
        }

        params = $.param(params);

        let queryURL = "https://api.openweathermap.org/data/2.5/weather?" + params;

        $.ajax(
        {
        url: queryURL,
        method: "GET"
        })
        .then(function(response) 
        {
            let forecast = response;

            if (newBtn)
            {
            createLocationButton(forecast.name + ", " + forecast.sys.country);
            }

            $("#location-name").text(forecast.name);
            $("#current-temp").text("Current: " + kelvinToFahrenheit(forecast.main.temp, 1) + '\u00B0' + "F");
            $("#feels-like").text("Feels like: " + kelvinToFahrenheit(forecast.main.feels_like, 1) + '\u00B0' + "F");
            $("#current-humidity").text("Humidity: " + forecast.main.humidity + "%");
            $("#current-wind").text("Wind: " + forecast.wind.speed.toFixed(0) + windDirection(forecast.wind.deg));
            $("#weather-condition").attr("src", "http://openweathermap.org/img/wn/" + forecast.weather[0].icon + "@2x.png")

            let paramsWeek = 
            {
            lat: forecast.coord.lat,
            lon: forecast.coord.lon,
            exclude: "minutely,hourly",
            appid: "87cd2f3bae194c48a4c4081e9ab09c49"
            }

            paramsWeek = $.param(paramsWeek);

            let queryURLWeek = "https://api.openweathermap.org/data/2.5/onecall?" + paramsWeek;
            console.log(queryURLWeek);

            $.ajax(
            {
            url: queryURLWeek,
            method: "GET"
            })
            .then(function(response) 
            {
            let forecast = response;

            $("#temp-high").text("High: " + kelvinToFahrenheit(forecast.daily[0].temp.max, 0) + '\u00B0' + "F");
            $("#temp-low").text("Low: " + kelvinToFahrenheit(forecast.daily[0].temp.min, 0) + '\u00B0' + "F");
            $("#current-uv").text("UV Index: " + forecast.current.uvi);

            for (i=0; i<6; i++)
            {
                $("#conditions" + i).attr("src", "http://openweathermap.org/img/wn/" + forecast.daily[i].weather[0].icon + "@2x.png")
                $("#temp-day" + i).text(kelvinToFahrenheit(forecast.daily[i].temp.max, 0) + "/" + kelvinToFahrenheit(forecast.daily[i].temp.min, 0) + '\u00B0' + "F");
                $("#humidity-day" + i).text("Humidity: " + forecast.daily[i].humidity + "%");
                $("#wind-day" + i).text("Wind: " + forecast.daily[i].wind_speed.toFixed(0) + windDirection(forecast.daily[i].wind_deg));
                $("#precip-day" + i).text("Precip: " + forecast.daily[i].pop + "%");
            }
            });
        });
    }

    //Quick searches existing locations when shortcut button is clicked
    $(document).on("click", ".location-button", function()
    {
        let location = $(this).attr("data-location");
        resetActiveButton();
        $(this).addClass("active");
        pullWeatherData(location, false);
    })

    //Event for search button, sends data to api for weather information and creates new shortcut button
    $("#location-search").on("submit", function(event)
    {
        event.preventDefault();
        let location = $("#location-input").val();
        $("#location-input").val("");
        pullWeatherData(location, true);
    })
})