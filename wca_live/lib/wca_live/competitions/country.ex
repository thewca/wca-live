defmodule WcaLive.Competitions.Country do
  defstruct [:iso2, :name, :continent_name]

  @type t :: %__MODULE__{
          iso2: String.t(),
          name: String.t(),
          continent_name: String.t()
        }

  @country_attrs [
    %{
      iso2: "AF",
      name: "Afghanistan",
      continent_name: "Asia"
    },
    %{
      iso2: "AL",
      name: "Albania",
      continent_name: "Europe"
    },
    %{
      iso2: "DZ",
      name: "Algeria",
      continent_name: "Africa"
    },
    %{
      iso2: "AD",
      name: "Andorra",
      continent_name: "Europe"
    },
    %{
      iso2: "AO",
      name: "Angola",
      continent_name: "Africa"
    },
    %{
      iso2: "AG",
      name: "Antigua and Barbuda",
      continent_name: "North America"
    },
    %{
      iso2: "AR",
      name: "Argentina",
      continent_name: "South America"
    },
    %{
      iso2: "AM",
      name: "Armenia",
      continent_name: "Asia"
    },
    %{
      iso2: "AU",
      name: "Australia",
      continent_name: "Oceania"
    },
    %{
      iso2: "AT",
      name: "Austria",
      continent_name: "Europe"
    },
    %{
      iso2: "AZ",
      name: "Azerbaijan",
      continent_name: "Europe"
    },
    %{
      iso2: "BS",
      name: "Bahamas",
      continent_name: "North America"
    },
    %{
      iso2: "BH",
      name: "Bahrain",
      continent_name: "Asia"
    },
    %{
      iso2: "BD",
      name: "Bangladesh",
      continent_name: "Asia"
    },
    %{
      iso2: "BB",
      name: "Barbados",
      continent_name: "North America"
    },
    %{
      iso2: "BY",
      name: "Belarus",
      continent_name: "Europe"
    },
    %{
      iso2: "BE",
      name: "Belgium",
      continent_name: "Europe"
    },
    %{
      iso2: "BZ",
      name: "Belize",
      continent_name: "North America"
    },
    %{
      iso2: "BJ",
      name: "Benin",
      continent_name: "Africa"
    },
    %{
      iso2: "BT",
      name: "Bhutan",
      continent_name: "Asia"
    },
    %{
      iso2: "BO",
      name: "Bolivia",
      continent_name: "South America"
    },
    %{
      iso2: "BA",
      name: "Bosnia and Herzegovina",
      continent_name: "Europe"
    },
    %{
      iso2: "BW",
      name: "Botswana",
      continent_name: "Africa"
    },
    %{
      iso2: "BR",
      name: "Brazil",
      continent_name: "South America"
    },
    %{
      iso2: "BN",
      name: "Brunei",
      continent_name: "Asia"
    },
    %{
      iso2: "BG",
      name: "Bulgaria",
      continent_name: "Europe"
    },
    %{
      iso2: "BF",
      name: "Burkina Faso",
      continent_name: "Africa"
    },
    %{
      iso2: "BI",
      name: "Burundi",
      continent_name: "Africa"
    },
    %{
      iso2: "CV",
      name: "Cabo Verde",
      continent_name: "Africa"
    },
    %{
      iso2: "KH",
      name: "Cambodia",
      continent_name: "Asia"
    },
    %{
      iso2: "CM",
      name: "Cameroon",
      continent_name: "Africa"
    },
    %{
      iso2: "CA",
      name: "Canada",
      continent_name: "North America"
    },
    %{
      iso2: "CF",
      name: "Central African Republic",
      continent_name: "Africa"
    },
    %{
      iso2: "TD",
      name: "Chad",
      continent_name: "Africa"
    },
    %{
      iso2: "CL",
      name: "Chile",
      continent_name: "South America"
    },
    %{
      iso2: "CN",
      name: "China",
      continent_name: "Asia"
    },
    %{
      iso2: "CO",
      name: "Colombia",
      continent_name: "South America"
    },
    %{
      iso2: "KM",
      name: "Comoros",
      continent_name: "Africa"
    },
    %{
      iso2: "CG",
      name: "Congo",
      continent_name: "Africa"
    },
    %{
      iso2: "CR",
      name: "Costa Rica",
      continent_name: "North America"
    },
    %{
      iso2: "CI",
      name: "Côte d'Ivoire",
      continent_name: "Africa"
    },
    %{
      iso2: "HR",
      name: "Croatia",
      continent_name: "Europe"
    },
    %{
      iso2: "CU",
      name: "Cuba",
      continent_name: "North America"
    },
    %{
      iso2: "CY",
      name: "Cyprus",
      continent_name: "Europe"
    },
    %{
      iso2: "CZ",
      name: "Czech Republic",
      continent_name: "Europe"
    },
    %{
      iso2: "KP",
      name: "Democratic People’s Republic of Korea",
      continent_name: "Asia"
    },
    %{
      iso2: "CD",
      name: "Democratic Republic of the Congo",
      continent_name: "Africa"
    },
    %{
      iso2: "DK",
      name: "Denmark",
      continent_name: "Europe"
    },
    %{
      iso2: "DJ",
      name: "Djibouti",
      continent_name: "Africa"
    },
    %{
      iso2: "DM",
      name: "Dominica",
      continent_name: "North America"
    },
    %{
      iso2: "DO",
      name: "Dominican Republic",
      continent_name: "North America"
    },
    %{
      iso2: "EC",
      name: "Ecuador",
      continent_name: "South America"
    },
    %{
      iso2: "EG",
      name: "Egypt",
      continent_name: "Africa"
    },
    %{
      iso2: "SV",
      name: "El Salvador",
      continent_name: "North America"
    },
    %{
      iso2: "GQ",
      name: "Equatorial Guinea",
      continent_name: "Africa"
    },
    %{
      iso2: "ER",
      name: "Eritrea",
      continent_name: "Africa"
    },
    %{
      iso2: "EE",
      name: "Estonia",
      continent_name: "Europe"
    },
    %{
      iso2: "ET",
      name: "Ethiopia",
      continent_name: "Africa"
    },
    %{
      iso2: "FJ",
      name: "Fiji",
      continent_name: "Oceania"
    },
    %{
      iso2: "FI",
      name: "Finland",
      continent_name: "Europe"
    },
    %{
      iso2: "FR",
      name: "France",
      continent_name: "Europe"
    },
    %{
      iso2: "GA",
      name: "Gabon",
      continent_name: "Africa"
    },
    %{
      iso2: "GM",
      name: "Gambia",
      continent_name: "Africa"
    },
    %{
      iso2: "GE",
      name: "Georgia",
      continent_name: "Europe"
    },
    %{
      iso2: "DE",
      name: "Germany",
      continent_name: "Europe"
    },
    %{
      iso2: "GH",
      name: "Ghana",
      continent_name: "Africa"
    },
    %{
      iso2: "GR",
      name: "Greece",
      continent_name: "Europe"
    },
    %{
      iso2: "GD",
      name: "Grenada",
      continent_name: "North America"
    },
    %{
      iso2: "GT",
      name: "Guatemala",
      continent_name: "North America"
    },
    %{
      iso2: "GN",
      name: "Guinea",
      continent_name: "Africa"
    },
    %{
      iso2: "GW",
      name: "Guinea Bissau",
      continent_name: "Africa"
    },
    %{
      iso2: "GY",
      name: "Guyana",
      continent_name: "South America"
    },
    %{
      iso2: "HT",
      name: "Haiti",
      continent_name: "North America"
    },
    %{
      iso2: "VA",
      name: "Holy See",
      continent_name: "Europe"
    },
    %{
      iso2: "HN",
      name: "Honduras",
      continent_name: "North America"
    },
    %{
      iso2: "HK",
      name: "Hong Kong",
      continent_name: "Asia"
    },
    %{
      iso2: "HU",
      name: "Hungary",
      continent_name: "Europe"
    },
    %{
      iso2: "IS",
      name: "Iceland",
      continent_name: "Europe"
    },
    %{
      iso2: "IN",
      name: "India",
      continent_name: "Asia"
    },
    %{
      iso2: "ID",
      name: "Indonesia",
      continent_name: "Asia"
    },
    %{
      iso2: "IR",
      name: "Iran",
      continent_name: "Asia"
    },
    %{
      iso2: "IQ",
      name: "Iraq",
      continent_name: "Asia"
    },
    %{
      iso2: "IE",
      name: "Ireland",
      continent_name: "Europe"
    },
    %{
      iso2: "IL",
      name: "Israel",
      continent_name: "Europe"
    },
    %{
      iso2: "IT",
      name: "Italy",
      continent_name: "Europe"
    },
    %{
      iso2: "JM",
      name: "Jamaica",
      continent_name: "North America"
    },
    %{
      iso2: "JP",
      name: "Japan",
      continent_name: "Asia"
    },
    %{
      iso2: "JO",
      name: "Jordan",
      continent_name: "Asia"
    },
    %{
      iso2: "KZ",
      name: "Kazakhstan",
      continent_name: "Asia"
    },
    %{
      iso2: "KE",
      name: "Kenya",
      continent_name: "Africa"
    },
    %{
      iso2: "KI",
      name: "Kiribati",
      continent_name: "Oceania"
    },
    %{
      iso2: "XK",
      name: "Kosovo",
      continent_name: "Europe"
    },
    %{
      iso2: "KW",
      name: "Kuwait",
      continent_name: "Asia"
    },
    %{
      iso2: "KG",
      name: "Kyrgyzstan",
      continent_name: "Asia"
    },
    %{
      iso2: "LA",
      name: "Laos",
      continent_name: "Asia"
    },
    %{
      iso2: "LV",
      name: "Latvia",
      continent_name: "Europe"
    },
    %{
      iso2: "LB",
      name: "Lebanon",
      continent_name: "Asia"
    },
    %{
      iso2: "LS",
      name: "Lesotho",
      continent_name: "Africa"
    },
    %{
      iso2: "LR",
      name: "Liberia",
      continent_name: "Africa"
    },
    %{
      iso2: "LY",
      name: "Libya",
      continent_name: "Africa"
    },
    %{
      iso2: "LI",
      name: "Liechtenstein",
      continent_name: "Europe"
    },
    %{
      iso2: "LT",
      name: "Lithuania",
      continent_name: "Europe"
    },
    %{
      iso2: "LU",
      name: "Luxembourg",
      continent_name: "Europe"
    },
    %{
      iso2: "MO",
      name: "Macau",
      continent_name: "Asia"
    },
    %{
      iso2: "MG",
      name: "Madagascar",
      continent_name: "Africa"
    },
    %{
      iso2: "MW",
      name: "Malawi",
      continent_name: "Africa"
    },
    %{
      iso2: "MY",
      name: "Malaysia",
      continent_name: "Asia"
    },
    %{
      iso2: "MV",
      name: "Maldives",
      continent_name: "Asia"
    },
    %{
      iso2: "ML",
      name: "Mali",
      continent_name: "Africa"
    },
    %{
      iso2: "MT",
      name: "Malta",
      continent_name: "Europe"
    },
    %{
      iso2: "MH",
      name: "Marshall Islands",
      continent_name: "Oceania"
    },
    %{
      iso2: "MR",
      name: "Mauritania",
      continent_name: "Africa"
    },
    %{
      iso2: "MU",
      name: "Mauritius",
      continent_name: "Africa"
    },
    %{
      iso2: "MX",
      name: "Mexico",
      continent_name: "North America"
    },
    %{
      iso2: "FM",
      name: "Federated States of Micronesia",
      continent_name: "Oceania"
    },
    %{
      iso2: "MC",
      name: "Monaco",
      continent_name: "Europe"
    },
    %{
      iso2: "MN",
      name: "Mongolia",
      continent_name: "Asia"
    },
    %{
      iso2: "ME",
      name: "Montenegro",
      continent_name: "Europe"
    },
    %{
      iso2: "MA",
      name: "Morocco",
      continent_name: "Africa"
    },
    %{
      iso2: "MZ",
      name: "Mozambique",
      continent_name: "Africa"
    },
    %{
      iso2: "MM",
      name: "Myanmar",
      continent_name: "Asia"
    },
    %{
      iso2: "NA",
      name: "Namibia",
      continent_name: "Africa"
    },
    %{
      iso2: "NR",
      name: "Nauru",
      continent_name: "Oceania"
    },
    %{
      iso2: "NP",
      name: "Nepal",
      continent_name: "Asia"
    },
    %{
      iso2: "NL",
      name: "Netherlands",
      continent_name: "Europe"
    },
    %{
      iso2: "NZ",
      name: "New Zealand",
      continent_name: "Oceania"
    },
    %{
      iso2: "NI",
      name: "Nicaragua",
      continent_name: "North America"
    },
    %{
      iso2: "NE",
      name: "Niger",
      continent_name: "Africa"
    },
    %{
      iso2: "NG",
      name: "Nigeria",
      continent_name: "Africa"
    },
    %{
      iso2: "NO",
      name: "Norway",
      continent_name: "Europe"
    },
    %{
      iso2: "OM",
      name: "Oman",
      continent_name: "Asia"
    },
    %{
      iso2: "PK",
      name: "Pakistan",
      continent_name: "Asia"
    },
    %{
      iso2: "PW",
      name: "Palau",
      continent_name: "Oceania"
    },
    %{
      iso2: "PS",
      name: "Palestine",
      continent_name: "Asia"
    },
    %{
      iso2: "PA",
      name: "Panama",
      continent_name: "North America"
    },
    %{
      iso2: "PG",
      name: "Papua New Guinea",
      continent_name: "Oceania"
    },
    %{
      iso2: "PY",
      name: "Paraguay",
      continent_name: "South America"
    },
    %{
      iso2: "PE",
      name: "Peru",
      continent_name: "South America"
    },
    %{
      iso2: "PH",
      name: "Philippines",
      continent_name: "Asia"
    },
    %{
      iso2: "PL",
      name: "Poland",
      continent_name: "Europe"
    },
    %{
      iso2: "PT",
      name: "Portugal",
      continent_name: "Europe"
    },
    %{
      iso2: "QA",
      name: "Qatar",
      continent_name: "Asia"
    },
    %{
      iso2: "KR",
      name: "Republic of Korea",
      continent_name: "Asia"
    },
    %{
      iso2: "MD",
      name: "Moldova",
      continent_name: "Europe"
    },
    %{
      iso2: "RO",
      name: "Romania",
      continent_name: "Europe"
    },
    %{
      iso2: "RU",
      name: "Russia",
      continent_name: "Europe"
    },
    %{
      iso2: "RW",
      name: "Rwanda",
      continent_name: "Africa"
    },
    %{
      iso2: "KN",
      name: "Saint Kitts and Nevis",
      continent_name: "North America"
    },
    %{
      iso2: "LC",
      name: "Saint Lucia",
      continent_name: "North America"
    },
    %{
      iso2: "VC",
      name: "Saint Vincent and the Grenadines",
      continent_name: "North America"
    },
    %{
      iso2: "WS",
      name: "Samoa",
      continent_name: "Oceania"
    },
    %{
      iso2: "SM",
      name: "San Marino",
      continent_name: "Europe"
    },
    %{
      iso2: "ST",
      name: "São Tomé and Príncipe",
      continent_name: "Africa"
    },
    %{
      iso2: "SA",
      name: "Saudi Arabia",
      continent_name: "Asia"
    },
    %{
      iso2: "SN",
      name: "Senegal",
      continent_name: "Africa"
    },
    %{
      iso2: "RS",
      name: "Serbia",
      continent_name: "Europe"
    },
    %{
      iso2: "SC",
      name: "Seychelles",
      continent_name: "Africa"
    },
    %{
      iso2: "SL",
      name: "Sierra Leone",
      continent_name: "Africa"
    },
    %{
      iso2: "SG",
      name: "Singapore",
      continent_name: "Asia"
    },
    %{
      iso2: "SK",
      name: "Slovakia",
      continent_name: "Europe"
    },
    %{
      iso2: "SI",
      name: "Slovenia",
      continent_name: "Europe"
    },
    %{
      iso2: "SB",
      name: "Solomon Islands",
      continent_name: "Oceania"
    },
    %{
      iso2: "SO",
      name: "Somalia",
      continent_name: "Africa"
    },
    %{
      iso2: "ZA",
      name: "South Africa",
      continent_name: "Africa"
    },
    %{
      iso2: "SS",
      name: "South Sudan",
      continent_name: "Africa"
    },
    %{
      iso2: "ES",
      name: "Spain",
      continent_name: "Europe"
    },
    %{
      iso2: "LK",
      name: "Sri Lanka",
      continent_name: "Asia"
    },
    %{
      iso2: "SD",
      name: "Sudan",
      continent_name: "Africa"
    },
    %{
      iso2: "SR",
      name: "Suriname",
      continent_name: "South America"
    },
    %{
      iso2: "SZ",
      name: "Swaziland",
      continent_name: "Africa"
    },
    %{
      iso2: "SE",
      name: "Sweden",
      continent_name: "Europe"
    },
    %{
      iso2: "CH",
      name: "Switzerland",
      continent_name: "Europe"
    },
    %{
      iso2: "SY",
      name: "Syria",
      continent_name: "Asia"
    },
    %{
      iso2: "TW",
      name: "Taiwan",
      continent_name: "Asia"
    },
    %{
      iso2: "TJ",
      name: "Tajikistan",
      continent_name: "Asia"
    },
    %{
      iso2: "TH",
      name: "Thailand",
      continent_name: "Asia"
    },
    %{
      iso2: "MK",
      name: "Macedonia",
      continent_name: "Europe"
    },
    %{
      iso2: "TL",
      name: "Timor-Leste",
      continent_name: "Asia"
    },
    %{
      iso2: "TG",
      name: "Togo",
      continent_name: "Africa"
    },
    %{
      iso2: "TO",
      name: "Tonga",
      continent_name: "Oceania"
    },
    %{
      iso2: "TT",
      name: "Trinidad and Tobago",
      continent_name: "North America"
    },
    %{
      iso2: "TN",
      name: "Tunisia",
      continent_name: "Africa"
    },
    %{
      iso2: "TR",
      name: "Turkey",
      continent_name: "Europe"
    },
    %{
      iso2: "TM",
      name: "Turkmenistan",
      continent_name: "Asia"
    },
    %{
      iso2: "TV",
      name: "Tuvalu",
      continent_name: "Oceania"
    },
    %{
      iso2: "UG",
      name: "Uganda",
      continent_name: "Africa"
    },
    %{
      iso2: "UA",
      name: "Ukraine",
      continent_name: "Europe"
    },
    %{
      iso2: "AE",
      name: "United Arab Emirates",
      continent_name: "Asia"
    },
    %{
      iso2: "GB",
      name: "United Kingdom",
      continent_name: "Europe"
    },
    %{
      iso2: "TZ",
      name: "Tanzania",
      continent_name: "Africa"
    },
    %{
      iso2: "US",
      name: "United States",
      continent_name: "North America"
    },
    %{
      iso2: "UY",
      name: "Uruguay",
      continent_name: "South America"
    },
    %{
      iso2: "UZ",
      name: "Uzbekistan",
      continent_name: "Asia"
    },
    %{
      iso2: "VU",
      name: "Vanuatu",
      continent_name: "Oceania"
    },
    %{
      iso2: "VE",
      name: "Venezuela",
      continent_name: "South America"
    },
    %{
      iso2: "VN",
      name: "Vietnam",
      continent_name: "Asia"
    },
    %{
      iso2: "YE",
      name: "Yemen",
      continent_name: "Asia"
    },
    %{
      iso2: "ZM",
      name: "Zambia",
      continent_name: "Africa"
    },
    %{
      iso2: "ZW",
      name: "Zimbabwe",
      continent_name: "Africa"
    }
  ]

  def get_by_iso2!(iso2) do
    @country_attrs
    |> Enum.find(fn country -> country.iso2 == iso2 end)
    |> case do
      nil ->
        raise ArgumentError, message: "Invalid country iso2 code \"#{iso2}\"."

      attrs ->
        struct(__MODULE__, attrs)
    end
  end
end
