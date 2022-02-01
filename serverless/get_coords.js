const fetch = require("node-fetch");
const { parse } = require("path");

const { WEATER_API_KEY } = process.env;

exports.handler = async (event, context) => {
	const params = JSON.parse(event.body);
	const { text, units } = params;
	const regex = /^\d+$/g;
	const flag = regex.test(text) ? "zip" : "q";
	const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=${units}&appid=${WEATER_API_KEY}`;
	const encodedUrl = encodeURI(url);
	try {
		const dataStreem = await fetch(encodedUrl);
		const jsonData = await dataStreem.json();
		return {
			statusCode: 200,
			body: JSON.stringify(jsonData)
		};
	} catch (err){
		return { statusCode: 422, body: err.stack };
	}
}