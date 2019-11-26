//IMPORT LIBRARY
const express = require('express');
const server = express();
const hbs = require('hbs');
var mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

//DB CONNECTION
var con = mysql.createConnection({
    host: "q57yawiwmnaw13d2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "raxvni11r26ehoy9",
    password: "po3nhu0acqpycwiq",
    database: "teha3le6vwyo1uu0"
});

//DECLARATION
var displayData;
var displayItem;
var countryData = [];

//SETTINGS - Friend edited
server.use(express.static(__dirname + '/public'));
server.use(bodyParser.urlencoded({extended: true}));
server.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/template');
hbs.registerPartials(__dirname + '/views');

//DEFAULT INDEX PAGE
server.get('/', (req, res) => {
    res.render('index.hbs');
});

//About Us section
server.get('/aboutus', (req, res) => {
    res.render('index.hbs/#about');
});

//Country Info PAGE
 server.get('/countryInfo', (req, res) => {
     res.render('countryInfo.hbs');
});

//Currency Info PAGE
server.get('/currencyInfo', (req, res) => {
    res.render('currencyInfo.hbs');

   //Currency Exchange API LINK// https://api.exchangerate-api.com/v4/latest/{}
});

//Records page (History)
server.get('/records', (req, res) => {
    displayData = [];
    con.query("SELECT * FROM country_info", function (err, result, fields) {
        if (err) throw err;
        for(var pos = 0; pos < result.length; pos++){
            const name = result[pos].country_name;
            const capital = result[pos].country_capital;
            const region = result[pos].country_region;
            const population = result[pos].country_population;
            const timezones = result[pos].country_timezones;
            const currency_name = result[pos].country_currencyname;
            const currency_code = result[pos].country_currencycode;
            const currency_symbol = result[pos].country_currencysymbol;
            const country_flag = result[pos].country_flag;
            displayData.push({'name': name, 'capital': capital, 'region': region, 'population': population, 'timezones':timezones, 'currency_name': currency_name, 'currency_code':currency_code, 'currency_symbol':currency_symbol, 'country_flag':country_flag});
        }
        setTimeout(function(){
            // insertDB(dataArray);
            res.render('records.hbs');
        }, 200)
    });
})

//Helper for display info - Block Helper
hbs.registerHelper('list', (items, options) => {
    items = displayData;
    var out ="";

    const length = items.length;

    for(var i=0; i<length; i++){
        out = out + options.fn(items[i]);
    }

    return out;
});

//Currency Info Search Function
server.post('/currencySearch', (req, res) => {
    var currency_code = req.body.query;
    displayItem = currency_code;
    // conversionName = [];
    displayData = [];
    const querystr1 = `https://api.exchangerate-api.com/v4/latest/${currency_code}`;
    axios.get(querystr1).then((response) => {
        for (var key in response.data.rates){
            const name = key;
            const rate = response.data.rates[key];

            //PUSH TO ARRAY
            displayData.push({'name': name, 'rate': rate});
        }
        setTimeout(function(){
            res.render('currencySearch.hbs', { mainItem: currency_code });
        }, 200)
    })
});

//Country Information Search Function
server.post('/search', (req, res) => {
    var country_name = req.body.query;
    countryData = [];
    displayData = [];
    const querystr1 = `https://restcountries.eu/rest/v2/name/${country_name}`;
    axios.get(querystr1).then((response) => {
        for(var pos = 0; pos < response.data.length; pos++){
            const name = response.data[pos].name;
            const capital = response.data[pos].capital;
            const region = response.data[pos].region;
            const population = response.data[pos].population;
            const timezones = response.data[pos].timezones;
            const currency_name = response.data[pos].currencies[0].name;
            const currency_code = response.data[pos].currencies[0].code;
            const currency_symbol = response.data[pos].currencies[0].symbol;
            const country_flag = response.data[pos].alpha2Code;
            //push to array
            countryData.push([name, capital, region, population, timezones, currency_name, currency_code, currency_symbol, country_flag]);
            displayData.push({'name': name, 'capital': capital, 'region': region, 'population': population, 'timezones':timezones, 'currency_name': currency_name, 'currency_code':currency_code, 'currency_symbol':currency_symbol, 'country_flag':country_flag});
        }
        //HERE
        setTimeout(function(){
            addToDB(countryData);
            res.render('search.hbs');
        }, 200)
    })
});

server.listen(process.env.PORT || 5000, () => {
    console.log('Done^^');
});

function addToDB(dbData){
    var sql = `INSERT INTO country_info (country_name, country_capital, country_region, country_population, country_timezones, country_currencyname, country_currencycode, country_currencysymbol, country_flag) VALUES ?`;
    con.query(sql, [dbData],function (err, result) {
        if (err) throw err;
        console.log("Multiple record inserted");
    });
}

server.post('/del', (req, res) => {
    var sql = `DELETE FROM country_info`;
    con.query(sql,function (err, result) {
        if (err) throw err;
        console.log('Data has been cleared');
        res.render('index.hbs');
    });
});
