/* Taken from WCA States list. */
const countries = [
  {
    id: "Afghanistan",
    name: "Afghanistan",
    iso2: "AF",
    continentId: "_Asia"
  },
  {
    id: "Albania",
    name: "Albania",
    iso2: "AL",
    continentId: "_Europe"
  },
  {
    id: "Algeria",
    name: "Algeria",
    iso2: "DZ",
    continentId: "_Africa"
  },
  {
    id: "Andorra",
    name: "Andorra",
    iso2: "AD",
    continentId: "_Europe"
  },
  {
    id: "Angola",
    name: "Angola",
    iso2: "AO",
    continentId: "_Africa"
  },
  {
    id: "Antigua and Barbuda",
    name: "Antigua and Barbuda",
    iso2: "AG",
    continentId: "_North America"
  },
  {
    id: "Argentina",
    name: "Argentina",
    iso2: "AR",
    continentId: "_South America"
  },
  {
    id: "Armenia",
    name: "Armenia",
    iso2: "AM",
    continentId: "_Asia"
  },
  {
    id: "Australia",
    name: "Australia",
    iso2: "AU",
    continentId: "_Oceania"
  },
  {
    id: "Austria",
    name: "Austria",
    iso2: "AT",
    continentId: "_Europe"
  },
  {
    id: "Azerbaijan",
    name: "Azerbaijan",
    iso2: "AZ",
    continentId: "_Europe"
  },
  {
    id: "Bahamas",
    name: "Bahamas",
    iso2: "BS",
    continentId: "_North America"
  },
  {
    id: "Bahrain",
    name: "Bahrain",
    iso2: "BH",
    continentId: "_Asia"
  },
  {
    id: "Bangladesh",
    name: "Bangladesh",
    iso2: "BD",
    continentId: "_Asia"
  },
  {
    id: "Barbados",
    name: "Barbados",
    iso2: "BB",
    continentId: "_North America"
  },
  {
    id: "Belarus",
    name: "Belarus",
    iso2: "BY",
    continentId: "_Europe"
  },
  {
    id: "Belgium",
    name: "Belgium",
    iso2: "BE",
    continentId: "_Europe"
  },
  {
    id: "Belize",
    name: "Belize",
    iso2: "BZ",
    continentId: "_North America"
  },
  {
    id: "Benin",
    name: "Benin",
    iso2: "BJ",
    continentId: "_Africa"
  },
  {
    id: "Bhutan",
    name: "Bhutan",
    iso2: "BT",
    continentId: "_Asia"
  },
  {
    id: "Bolivia",
    name: "Bolivia",
    iso2: "BO",
    continentId: "_South America"
  },
  {
    id: "Bosnia and Herzegovina",
    name: "Bosnia and Herzegovina",
    iso2: "BA",
    continentId: "_Europe"
  },
  {
    id: "Botswana",
    name: "Botswana",
    iso2: "BW",
    continentId: "_Africa"
  },
  {
    id: "Brazil",
    name: "Brazil",
    iso2: "BR",
    continentId: "_South America"
  },
  {
    id: "Brunei",
    name: "Brunei",
    iso2: "BN",
    continentId: "_Asia"
  },
  {
    id: "Bulgaria",
    name: "Bulgaria",
    iso2: "BG",
    continentId: "_Europe"
  },
  {
    id: "Burkina Faso",
    name: "Burkina Faso",
    iso2: "BF",
    continentId: "_Africa"
  },
  {
    id: "Burundi",
    name: "Burundi",
    iso2: "BI",
    continentId: "_Africa"
  },
  {
    id: "Cabo Verde",
    name: "Cabo Verde",
    iso2: "CV",
    continentId: "_Africa"
  },
  {
    id: "Cambodia",
    name: "Cambodia",
    iso2: "KH",
    continentId: "_Asia"
  },
  {
    id: "Cameroon",
    name: "Cameroon",
    iso2: "CM",
    continentId: "_Africa"
  },
  {
    id: "Canada",
    name: "Canada",
    iso2: "CA",
    continentId: "_North America"
  },
  {
    id: "Central African Republic",
    name: "Central African Republic",
    iso2: "CF",
    continentId: "_Africa"
  },
  {
    id: "Chad",
    name: "Chad",
    iso2: "TD",
    continentId: "_Africa"
  },
  {
    id: "Chile",
    name: "Chile",
    iso2: "CL",
    continentId: "_South America"
  },
  {
    id: "China",
    name: "China",
    iso2: "CN",
    continentId: "_Asia"
  },
  {
    id: "Colombia",
    name: "Colombia",
    iso2: "CO",
    continentId: "_South America"
  },
  {
    id: "Comoros",
    name: "Comoros",
    iso2: "KM",
    continentId: "_Africa"
  },
  {
    id: "Congo",
    name: "Congo",
    iso2: "CG",
    continentId: "_Africa"
  },
  {
    id: "Costa Rica",
    name: "Costa Rica",
    iso2: "CR",
    continentId: "_North America"
  },
  {
    id: "Cote d_Ivoire",
    name: "Côte d'Ivoire",
    iso2: "CI",
    continentId: "_Africa"
  },
  {
    id: "Croatia",
    name: "Croatia",
    iso2: "HR",
    continentId: "_Europe"
  },
  {
    id: "Cuba",
    name: "Cuba",
    iso2: "CU",
    continentId: "_North America"
  },
  {
    id: "Cyprus",
    name: "Cyprus",
    iso2: "CY",
    continentId: "_Europe"
  },
  {
    id: "Czech Republic",
    name: "Czech Republic",
    iso2: "CZ",
    continentId: "_Europe"
  },
  {
    id: "Democratic People_s Republic of Korea",
    name: "Democratic People’s Republic of Korea",
    iso2: "KP",
    continentId: "_Asia"
  },
  {
    id: "Democratic Republic of the Congo",
    name: "Democratic Republic of the Congo",
    iso2: "CD",
    continentId: "_Africa"
  },
  {
    id: "Denmark",
    name: "Denmark",
    iso2: "DK",
    continentId: "_Europe"
  },
  {
    id: "Djibouti",
    name: "Djibouti",
    iso2: "DJ",
    continentId: "_Africa"
  },
  {
    id: "Dominica",
    name: "Dominica",
    iso2: "DM",
    continentId: "_North America"
  },
  {
    id: "Dominican Republic",
    name: "Dominican Republic",
    iso2: "DO",
    continentId: "_North America"
  },
  {
    id: "Ecuador",
    name: "Ecuador",
    iso2: "EC",
    continentId: "_South America"
  },
  {
    id: "Egypt",
    name: "Egypt",
    iso2: "EG",
    continentId: "_Africa"
  },
  {
    id: "El Salvador",
    name: "El Salvador",
    iso2: "SV",
    continentId: "_North America"
  },
  {
    id: "Equatorial Guinea",
    name: "Equatorial Guinea",
    iso2: "GQ",
    continentId: "_Africa"
  },
  {
    id: "Eritrea",
    name: "Eritrea",
    iso2: "ER",
    continentId: "_Africa"
  },
  {
    id: "Estonia",
    name: "Estonia",
    iso2: "EE",
    continentId: "_Europe"
  },
  {
    id: "Ethiopia",
    name: "Ethiopia",
    iso2: "ET",
    continentId: "_Africa"
  },
  {
    id: "Fiji",
    name: "Fiji",
    iso2: "FJ",
    continentId: "_Oceania"
  },
  {
    id: "Finland",
    name: "Finland",
    iso2: "FI",
    continentId: "_Europe"
  },
  {
    id: "France",
    name: "France",
    iso2: "FR",
    continentId: "_Europe"
  },
  {
    id: "Gabon",
    name: "Gabon",
    iso2: "GA",
    continentId: "_Africa"
  },
  {
    id: "Gambia",
    name: "Gambia",
    iso2: "GM",
    continentId: "_Africa"
  },
  {
    id: "Georgia",
    name: "Georgia",
    iso2: "GE",
    continentId: "_Europe"
  },
  {
    id: "Germany",
    name: "Germany",
    iso2: "DE",
    continentId: "_Europe"
  },
  {
    id: "Ghana",
    name: "Ghana",
    iso2: "GH",
    continentId: "_Africa"
  },
  {
    id: "Greece",
    name: "Greece",
    iso2: "GR",
    continentId: "_Europe"
  },
  {
    id: "Grenada",
    name: "Grenada",
    iso2: "GD",
    continentId: "_North America"
  },
  {
    id: "Guatemala",
    name: "Guatemala",
    iso2: "GT",
    continentId: "_North America"
  },
  {
    id: "Guinea",
    name: "Guinea",
    iso2: "GN",
    continentId: "_Africa"
  },
  {
    id: "Guinea Bissau",
    name: "Guinea Bissau",
    iso2: "GW",
    continentId: "_Africa"
  },
  {
    id: "Guyana",
    name: "Guyana",
    iso2: "GY",
    continentId: "_South America"
  },
  {
    id: "Haiti",
    name: "Haiti",
    iso2: "HT",
    continentId: "_North America"
  },
  {
    id: "Holy See",
    name: "Holy See",
    iso2: "VA",
    continentId: "_Europe"
  },
  {
    id: "Honduras",
    name: "Honduras",
    iso2: "HN",
    continentId: "_North America"
  },
  {
    id: "Hong Kong",
    name: "Hong Kong",
    iso2: "HK",
    continentId: "_Asia"
  },
  {
    id: "Hungary",
    name: "Hungary",
    iso2: "HU",
    continentId: "_Europe"
  },
  {
    id: "Iceland",
    name: "Iceland",
    iso2: "IS",
    continentId: "_Europe"
  },
  {
    id: "India",
    name: "India",
    iso2: "IN",
    continentId: "_Asia"
  },
  {
    id: "Indonesia",
    name: "Indonesia",
    iso2: "ID",
    continentId: "_Asia"
  },
  {
    id: "Iran",
    name: "Iran",
    iso2: "IR",
    continentId: "_Asia"
  },
  {
    id: "Iraq",
    name: "Iraq",
    iso2: "IQ",
    continentId: "_Asia"
  },
  {
    id: "Ireland",
    name: "Ireland",
    iso2: "IE",
    continentId: "_Europe"
  },
  {
    id: "Israel",
    name: "Israel",
    iso2: "IL",
    continentId: "_Europe"
  },
  {
    id: "Italy",
    name: "Italy",
    iso2: "IT",
    continentId: "_Europe"
  },
  {
    id: "Jamaica",
    name: "Jamaica",
    iso2: "JM",
    continentId: "_North America"
  },
  {
    id: "Japan",
    name: "Japan",
    iso2: "JP",
    continentId: "_Asia"
  },
  {
    id: "Jordan",
    name: "Jordan",
    iso2: "JO",
    continentId: "_Asia"
  },
  {
    id: "Kazakhstan",
    name: "Kazakhstan",
    iso2: "KZ",
    continentId: "_Asia"
  },
  {
    id: "Kenya",
    name: "Kenya",
    iso2: "KE",
    continentId: "_Africa"
  },
  {
    id: "Kiribati",
    name: "Kiribati",
    iso2: "KI",
    continentId: "_Oceania"
  },
  {
    id: "Kosovo",
    name: "Kosovo",
    iso2: "XK",
    continentId: "_Europe"
  },
  {
    id: "Kuwait",
    name: "Kuwait",
    iso2: "KW",
    continentId: "_Asia"
  },
  {
    id: "Kyrgyzstan",
    name: "Kyrgyzstan",
    iso2: "KG",
    continentId: "_Asia"
  },
  {
    id: "Laos",
    name: "Laos",
    iso2: "LA",
    continentId: "_Asia"
  },
  {
    id: "Latvia",
    name: "Latvia",
    iso2: "LV",
    continentId: "_Europe"
  },
  {
    id: "Lebanon",
    name: "Lebanon",
    iso2: "LB",
    continentId: "_Asia"
  },
  {
    id: "Lesotho",
    name: "Lesotho",
    iso2: "LS",
    continentId: "_Africa"
  },
  {
    id: "Liberia",
    name: "Liberia",
    iso2: "LR",
    continentId: "_Africa"
  },
  {
    id: "Libya",
    name: "Libya",
    iso2: "LY",
    continentId: "_Africa"
  },
  {
    id: "Liechtenstein",
    name: "Liechtenstein",
    iso2: "LI",
    continentId: "_Europe"
  },
  {
    id: "Lithuania",
    name: "Lithuania",
    iso2: "LT",
    continentId: "_Europe"
  },
  {
    id: "Luxembourg",
    name: "Luxembourg",
    iso2: "LU",
    continentId: "_Europe"
  },
  {
    id: "Macau",
    name: "Macau",
    iso2: "MO",
    continentId: "_Asia"
  },
  {
    id: "Madagascar",
    name: "Madagascar",
    iso2: "MG",
    continentId: "_Africa"
  },
  {
    id: "Malawi",
    name: "Malawi",
    iso2: "MW",
    continentId: "_Africa"
  },
  {
    id: "Malaysia",
    name: "Malaysia",
    iso2: "MY",
    continentId: "_Asia"
  },
  {
    id: "Maldives",
    name: "Maldives",
    iso2: "MV",
    continentId: "_Asia"
  },
  {
    id: "Mali",
    name: "Mali",
    iso2: "ML",
    continentId: "_Africa"
  },
  {
    id: "Malta",
    name: "Malta",
    iso2: "MT",
    continentId: "_Europe"
  },
  {
    id: "Marshall Islands",
    name: "Marshall Islands",
    iso2: "MH",
    continentId: "_Oceania"
  },
  {
    id: "Mauritania",
    name: "Mauritania",
    iso2: "MR",
    continentId: "_Africa"
  },
  {
    id: "Mauritius",
    name: "Mauritius",
    iso2: "MU",
    continentId: "_Africa"
  },
  {
    id: "Mexico",
    name: "Mexico",
    iso2: "MX",
    continentId: "_North America"
  },
  {
    id: "Federated States of Micronesia",
    name: "Federated States of Micronesia",
    iso2: "FM",
    continentId: "_Oceania"
  },
  {
    id: "Monaco",
    name: "Monaco",
    iso2: "MC",
    continentId: "_Europe"
  },
  {
    id: "Mongolia",
    name: "Mongolia",
    iso2: "MN",
    continentId: "_Asia"
  },
  {
    id: "Montenegro",
    name: "Montenegro",
    iso2: "ME",
    continentId: "_Europe"
  },
  {
    id: "Morocco",
    name: "Morocco",
    iso2: "MA",
    continentId: "_Africa"
  },
  {
    id: "Mozambique",
    name: "Mozambique",
    iso2: "MZ",
    continentId: "_Africa"
  },
  {
    id: "Myanmar",
    name: "Myanmar",
    iso2: "MM",
    continentId: "_Asia"
  },
  {
    id: "Namibia",
    name: "Namibia",
    iso2: "NA",
    continentId: "_Africa"
  },
  {
    id: "Nauru",
    name: "Nauru",
    iso2: "NR",
    continentId: "_Oceania"
  },
  {
    id: "Nepal",
    name: "Nepal",
    iso2: "NP",
    continentId: "_Asia"
  },
  {
    id: "Netherlands",
    name: "Netherlands",
    iso2: "NL",
    continentId: "_Europe"
  },
  {
    id: "New Zealand",
    name: "New Zealand",
    iso2: "NZ",
    continentId: "_Oceania"
  },
  {
    id: "Nicaragua",
    name: "Nicaragua",
    iso2: "NI",
    continentId: "_North America"
  },
  {
    id: "Niger",
    name: "Niger",
    iso2: "NE",
    continentId: "_Africa"
  },
  {
    id: "Nigeria",
    name: "Nigeria",
    iso2: "NG",
    continentId: "_Africa"
  },
  {
    id: "Norway",
    name: "Norway",
    iso2: "NO",
    continentId: "_Europe"
  },
  {
    id: "Oman",
    name: "Oman",
    iso2: "OM",
    continentId: "_Asia"
  },
  {
    id: "Pakistan",
    name: "Pakistan",
    iso2: "PK",
    continentId: "_Asia"
  },
  {
    id: "Palau",
    name: "Palau",
    iso2: "PW",
    continentId: "_Oceania"
  },
  {
    id: "Palestine",
    name: "Palestine",
    iso2: "PS",
    continentId: "_Asia"
  },
  {
    id: "Panama",
    name: "Panama",
    iso2: "PA",
    continentId: "_North America"
  },
  {
    id: "Papua New Guinea",
    name: "Papua New Guinea",
    iso2: "PG",
    continentId: "_Oceania"
  },
  {
    id: "Paraguay",
    name: "Paraguay",
    iso2: "PY",
    continentId: "_South America"
  },
  {
    id: "Peru",
    name: "Peru",
    iso2: "PE",
    continentId: "_South America"
  },
  {
    id: "Philippines",
    name: "Philippines",
    iso2: "PH",
    continentId: "_Asia"
  },
  {
    id: "Poland",
    name: "Poland",
    iso2: "PL",
    continentId: "_Europe"
  },
  {
    id: "Portugal",
    name: "Portugal",
    iso2: "PT",
    continentId: "_Europe"
  },
  {
    id: "Qatar",
    name: "Qatar",
    iso2: "QA",
    continentId: "_Asia"
  },
  {
    id: "Korea",
    name: "Republic of Korea",
    iso2: "KR",
    continentId: "_Asia"
  },
  {
    id: "Moldova",
    name: "Moldova",
    iso2: "MD",
    continentId: "_Europe"
  },
  {
    id: "Romania",
    name: "Romania",
    iso2: "RO",
    continentId: "_Europe"
  },
  {
    id: "Russia",
    name: "Russia",
    iso2: "RU",
    continentId: "_Europe"
  },
  {
    id: "Rwanda",
    name: "Rwanda",
    iso2: "RW",
    continentId: "_Africa"
  },
  {
    id: "Saint Kitts and Nevis",
    name: "Saint Kitts and Nevis",
    iso2: "KN",
    continentId: "_North America"
  },
  {
    id: "Saint Lucia",
    name: "Saint Lucia",
    iso2: "LC",
    continentId: "_North America"
  },
  {
    id: "Saint Vincent and the Grenadines",
    name: "Saint Vincent and the Grenadines",
    iso2: "VC",
    continentId: "_North America"
  },
  {
    id: "Samoa",
    name: "Samoa",
    iso2: "WS",
    continentId: "_Oceania"
  },
  {
    id: "San Marino",
    name: "San Marino",
    iso2: "SM",
    continentId: "_Europe"
  },
  {
    id: "Sao Tome and Principe",
    name: "São Tomé and Príncipe",
    iso2: "ST",
    continentId: "_Africa"
  },
  {
    id: "Saudi Arabia",
    name: "Saudi Arabia",
    iso2: "SA",
    continentId: "_Asia"
  },
  {
    id: "Senegal",
    name: "Senegal",
    iso2: "SN",
    continentId: "_Africa"
  },
  {
    id: "Serbia",
    name: "Serbia",
    iso2: "RS",
    continentId: "_Europe"
  },
  {
    id: "Seychelles",
    name: "Seychelles",
    iso2: "SC",
    continentId: "_Africa"
  },
  {
    id: "Sierra Leone",
    name: "Sierra Leone",
    iso2: "SL",
    continentId: "_Africa"
  },
  {
    id: "Singapore",
    name: "Singapore",
    iso2: "SG",
    continentId: "_Asia"
  },
  {
    id: "Slovakia",
    name: "Slovakia",
    iso2: "SK",
    continentId: "_Europe"
  },
  {
    id: "Slovenia",
    name: "Slovenia",
    iso2: "SI",
    continentId: "_Europe"
  },
  {
    id: "Solomon Islands",
    name: "Solomon Islands",
    iso2: "SB",
    continentId: "_Oceania"
  },
  {
    id: "Somalia",
    name: "Somalia",
    iso2: "SO",
    continentId: "_Africa"
  },
  {
    id: "South Africa",
    name: "South Africa",
    iso2: "ZA",
    continentId: "_Africa"
  },
  {
    id: "South Sudan",
    name: "South Sudan",
    iso2: "SS",
    continentId: "_Africa"
  },
  {
    id: "Spain",
    name: "Spain",
    iso2: "ES",
    continentId: "_Europe"
  },
  {
    id: "Sri Lanka",
    name: "Sri Lanka",
    iso2: "LK",
    continentId: "_Asia"
  },
  {
    id: "Sudan",
    name: "Sudan",
    iso2: "SD",
    continentId: "_Africa"
  },
  {
    id: "Suriname",
    name: "Suriname",
    iso2: "SR",
    continentId: "_South America"
  },
  {
    id: "Swaziland",
    name: "Swaziland",
    iso2: "SZ",
    continentId: "_Africa"
  },
  {
    id: "Sweden",
    name: "Sweden",
    iso2: "SE",
    continentId: "_Europe"
  },
  {
    id: "Switzerland",
    name: "Switzerland",
    iso2: "CH",
    continentId: "_Europe"
  },
  {
    id: "Syria",
    name: "Syria",
    iso2: "SY",
    continentId: "_Asia"
  },
  {
    id: "Taiwan",
    name: "Taiwan",
    iso2: "TW",
    continentId: "_Asia"
  },
  {
    id: "Tajikistan",
    name: "Tajikistan",
    iso2: "TJ",
    continentId: "_Asia"
  },
  {
    id: "Thailand",
    name: "Thailand",
    iso2: "TH",
    continentId: "_Asia"
  },
  {
    id: "Macedonia",
    name: "Macedonia",
    iso2: "MK",
    continentId: "_Europe"
  },
  {
    id: "Timor-Leste",
    name: "Timor-Leste",
    iso2: "TL",
    continentId: "_Asia"
  },
  {
    id: "Togo",
    name: "Togo",
    iso2: "TG",
    continentId: "_Africa"
  },
  {
    id: "Tonga",
    name: "Tonga",
    iso2: "TO",
    continentId: "_Oceania"
  },
  {
    id: "Trinidad and Tobago",
    name: "Trinidad and Tobago",
    iso2: "TT",
    continentId: "_North America"
  },
  {
    id: "Tunisia",
    name: "Tunisia",
    iso2: "TN",
    continentId: "_Africa"
  },
  {
    id: "Turkey",
    name: "Turkey",
    iso2: "TR",
    continentId: "_Europe"
  },
  {
    id: "Turkmenistan",
    name: "Turkmenistan",
    iso2: "TM",
    continentId: "_Asia"
  },
  {
    id: "Tuvalu",
    name: "Tuvalu",
    iso2: "TV",
    continentId: "_Oceania"
  },
  {
    id: "Uganda",
    name: "Uganda",
    iso2: "UG",
    continentId: "_Africa"
  },
  {
    id: "Ukraine",
    name: "Ukraine",
    iso2: "UA",
    continentId: "_Europe"
  },
  {
    id: "United Arab Emirates",
    name: "United Arab Emirates",
    iso2: "AE",
    continentId: "_Asia"
  },
  {
    id: "United Kingdom",
    name: "United Kingdom",
    iso2: "GB",
    continentId: "_Europe"
  },
  {
    id: "Tanzania",
    name: "Tanzania",
    iso2: "TZ",
    continentId: "_Africa"
  },
  {
    id: "USA",
    name: "United States",
    iso2: "US",
    continentId: "_North America"
  },
  {
    id: "Uruguay",
    name: "Uruguay",
    iso2: "UY",
    continentId: "_South America"
  },
  {
    id: "Uzbekistan",
    name: "Uzbekistan",
    iso2: "UZ",
    continentId: "_Asia"
  },
  {
    id: "Vanuatu",
    name: "Vanuatu",
    iso2: "VU",
    continentId: "_Oceania"
  },
  {
    id: "Venezuela",
    name: "Venezuela",
    iso2: "VE",
    continentId: "_South America"
  },
  {
    id: "Vietnam",
    name: "Vietnam",
    iso2: "VN",
    continentId: "_Asia"
  },
  {
    id: "Yemen",
    name: "Yemen",
    iso2: "YE",
    continentId: "_Asia"
  },
  {
    id: "Zambia",
    name: "Zambia",
    iso2: "ZM",
    continentId: "_Africa"
  },
  {
    id: "Zimbabwe",
    name: "Zimbabwe",
    iso2: "ZW",
    continentId: "_Africa"
  }
];

const countryByIso2 = iso2 => {
  return countries.find(country => country.iso2 === iso2.toUpperCase());
};

module.exports = {
  countryByIso2,
};
