defmodule WcaLive.Wca.Country do
  @moduledoc """
  A country officially recognised by the WCA.

  See https://github.com/thewca/wca-regulations/blob/draft/wca-states.md
  """

  defstruct [:iso2, :name, :wca_id, :continent_name]

  @type t :: %__MODULE__{
          iso2: String.t(),
          name: String.t(),
          wca_id: String.t(),
          continent_name: String.t()
        }

  # See: https://github.com/thewca/worldcubeassociation.org/blob/7b4cb36a82f8be8459f78976243383afce1ea06d/WcaOnRails/config/wca-states.json
  @country_attrs [
    %{
      iso2: "AF",
      name: "Afghanistan",
      wca_id: "Afghanistan",
      continent_name: "Asia"
    },
    %{
      iso2: "AL",
      name: "Albania",
      wca_id: "Albania",
      continent_name: "Europe"
    },
    %{
      iso2: "DZ",
      name: "Algeria",
      wca_id: "Algeria",
      continent_name: "Africa"
    },
    %{
      iso2: "AD",
      name: "Andorra",
      wca_id: "Andorra",
      continent_name: "Europe"
    },
    %{
      iso2: "AO",
      name: "Angola",
      wca_id: "Angola",
      continent_name: "Africa"
    },
    %{
      iso2: "AG",
      name: "Antigua and Barbuda",
      wca_id: "Antigua and Barbuda",
      continent_name: "North America"
    },
    %{
      iso2: "AR",
      name: "Argentina",
      wca_id: "Argentina",
      continent_name: "South America"
    },
    %{
      iso2: "AM",
      name: "Armenia",
      wca_id: "Armenia",
      continent_name: "Europe"
    },
    %{
      iso2: "AU",
      name: "Australia",
      wca_id: "Australia",
      continent_name: "Oceania"
    },
    %{
      iso2: "AT",
      name: "Austria",
      wca_id: "Austria",
      continent_name: "Europe"
    },
    %{
      iso2: "AZ",
      name: "Azerbaijan",
      wca_id: "Azerbaijan",
      continent_name: "Europe"
    },
    %{
      iso2: "BS",
      name: "Bahamas",
      wca_id: "Bahamas",
      continent_name: "North America"
    },
    %{
      iso2: "BH",
      name: "Bahrain",
      wca_id: "Bahrain",
      continent_name: "Asia"
    },
    %{
      iso2: "BD",
      name: "Bangladesh",
      wca_id: "Bangladesh",
      continent_name: "Asia"
    },
    %{
      iso2: "BB",
      name: "Barbados",
      wca_id: "Barbados",
      continent_name: "North America"
    },
    %{
      iso2: "BY",
      name: "Belarus",
      wca_id: "Belarus",
      continent_name: "Europe"
    },
    %{
      iso2: "BE",
      name: "Belgium",
      wca_id: "Belgium",
      continent_name: "Europe"
    },
    %{
      iso2: "BZ",
      name: "Belize",
      wca_id: "Belize",
      continent_name: "North America"
    },
    %{
      iso2: "BJ",
      name: "Benin",
      wca_id: "Benin",
      continent_name: "Africa"
    },
    %{
      iso2: "BT",
      name: "Bhutan",
      wca_id: "Bhutan",
      continent_name: "Asia"
    },
    %{
      iso2: "BO",
      name: "Bolivia",
      wca_id: "Bolivia",
      continent_name: "South America"
    },
    %{
      iso2: "BA",
      name: "Bosnia and Herzegovina",
      wca_id: "Bosnia and Herzegovina",
      continent_name: "Europe"
    },
    %{
      iso2: "BW",
      name: "Botswana",
      wca_id: "Botswana",
      continent_name: "Africa"
    },
    %{
      iso2: "BR",
      name: "Brazil",
      wca_id: "Brazil",
      continent_name: "South America"
    },
    %{
      iso2: "BN",
      name: "Brunei",
      wca_id: "Brunei",
      continent_name: "Asia"
    },
    %{
      iso2: "BG",
      name: "Bulgaria",
      wca_id: "Bulgaria",
      continent_name: "Europe"
    },
    %{
      iso2: "BF",
      name: "Burkina Faso",
      wca_id: "Burkina Faso",
      continent_name: "Africa"
    },
    %{
      iso2: "BI",
      name: "Burundi",
      wca_id: "Burundi",
      continent_name: "Africa"
    },
    %{
      iso2: "CV",
      name: "Cabo Verde",
      wca_id: "Cabo Verde",
      continent_name: "Africa"
    },
    %{
      iso2: "KH",
      name: "Cambodia",
      wca_id: "Cambodia",
      continent_name: "Asia"
    },
    %{
      iso2: "CM",
      name: "Cameroon",
      wca_id: "Cameroon",
      continent_name: "Africa"
    },
    %{
      iso2: "CA",
      name: "Canada",
      wca_id: "Canada",
      continent_name: "North America"
    },
    %{
      iso2: "CF",
      name: "Central African Republic",
      wca_id: "Central African Republic",
      continent_name: "Africa"
    },
    %{
      iso2: "TD",
      name: "Chad",
      wca_id: "Chad",
      continent_name: "Africa"
    },
    %{
      iso2: "CL",
      name: "Chile",
      wca_id: "Chile",
      continent_name: "South America"
    },
    %{
      iso2: "CN",
      name: "China",
      wca_id: "China",
      continent_name: "Asia"
    },
    %{
      iso2: "CO",
      name: "Colombia",
      wca_id: "Colombia",
      continent_name: "South America"
    },
    %{
      iso2: "KM",
      name: "Comoros",
      wca_id: "Comoros",
      continent_name: "Africa"
    },
    %{
      iso2: "CG",
      name: "Congo",
      wca_id: "Congo",
      continent_name: "Africa"
    },
    %{
      iso2: "CR",
      name: "Costa Rica",
      wca_id: "Costa Rica",
      continent_name: "North America"
    },
    %{
      iso2: "CI",
      name: "C\u00f4te d'Ivoire",
      wca_id: "Cote d_Ivoire",
      continent_name: "Africa"
    },
    %{
      iso2: "HR",
      name: "Croatia",
      wca_id: "Croatia",
      continent_name: "Europe"
    },
    %{
      iso2: "CU",
      name: "Cuba",
      wca_id: "Cuba",
      continent_name: "North America"
    },
    %{
      iso2: "CY",
      name: "Cyprus",
      wca_id: "Cyprus",
      continent_name: "Europe"
    },
    %{
      iso2: "CZ",
      name: "Czech Republic",
      wca_id: "Czech Republic",
      continent_name: "Europe"
    },
    %{
      iso2: "KP",
      name: "Democratic People's Republic of Korea",
      wca_id: "Democratic People_s Republic of Korea",
      continent_name: "Asia"
    },
    %{
      iso2: "CD",
      name: "Democratic Republic of the Congo",
      wca_id: "Democratic Republic of the Congo",
      continent_name: "Africa"
    },
    %{
      iso2: "DK",
      name: "Denmark",
      wca_id: "Denmark",
      continent_name: "Europe"
    },
    %{
      iso2: "DJ",
      name: "Djibouti",
      wca_id: "Djibouti",
      continent_name: "Africa"
    },
    %{
      iso2: "DM",
      name: "Dominica",
      wca_id: "Dominica",
      continent_name: "North America"
    },
    %{
      iso2: "DO",
      name: "Dominican Republic",
      wca_id: "Dominican Republic",
      continent_name: "North America"
    },
    %{
      iso2: "EC",
      name: "Ecuador",
      wca_id: "Ecuador",
      continent_name: "South America"
    },
    %{
      iso2: "EG",
      name: "Egypt",
      wca_id: "Egypt",
      continent_name: "Africa"
    },
    %{
      iso2: "SV",
      name: "El Salvador",
      wca_id: "El Salvador",
      continent_name: "North America"
    },
    %{
      iso2: "GQ",
      name: "Equatorial Guinea",
      wca_id: "Equatorial Guinea",
      continent_name: "Africa"
    },
    %{
      iso2: "ER",
      name: "Eritrea",
      wca_id: "Eritrea",
      continent_name: "Africa"
    },
    %{
      iso2: "EE",
      name: "Estonia",
      wca_id: "Estonia",
      continent_name: "Europe"
    },
    %{
      iso2: "SZ",
      name: "Eswatini",
      wca_id: "Eswatini",
      continent_name: "Africa"
    },
    %{
      iso2: "ET",
      name: "Ethiopia",
      wca_id: "Ethiopia",
      continent_name: "Africa"
    },
    %{
      iso2: "FM",
      name: "Federated States of Micronesia",
      wca_id: "Federated States of Micronesia",
      continent_name: "Oceania"
    },
    %{
      iso2: "FJ",
      name: "Fiji",
      wca_id: "Fiji",
      continent_name: "Oceania"
    },
    %{
      iso2: "FI",
      name: "Finland",
      wca_id: "Finland",
      continent_name: "Europe"
    },
    %{
      iso2: "FR",
      name: "France",
      wca_id: "France",
      continent_name: "Europe"
    },
    %{
      iso2: "GA",
      name: "Gabon",
      wca_id: "Gabon",
      continent_name: "Africa"
    },
    %{
      iso2: "GM",
      name: "Gambia",
      wca_id: "Gambia",
      continent_name: "Africa"
    },
    %{
      iso2: "GE",
      name: "Georgia",
      wca_id: "Georgia",
      continent_name: "Europe"
    },
    %{
      iso2: "DE",
      name: "Germany",
      wca_id: "Germany",
      continent_name: "Europe"
    },
    %{
      iso2: "GH",
      name: "Ghana",
      wca_id: "Ghana",
      continent_name: "Africa"
    },
    %{
      iso2: "GR",
      name: "Greece",
      wca_id: "Greece",
      continent_name: "Europe"
    },
    %{
      iso2: "GD",
      name: "Grenada",
      wca_id: "Grenada",
      continent_name: "North America"
    },
    %{
      iso2: "GT",
      name: "Guatemala",
      wca_id: "Guatemala",
      continent_name: "North America"
    },
    %{
      iso2: "GN",
      name: "Guinea",
      wca_id: "Guinea",
      continent_name: "Africa"
    },
    %{
      iso2: "GW",
      name: "Guinea Bissau",
      wca_id: "Guinea Bissau",
      continent_name: "Africa"
    },
    %{
      iso2: "GY",
      name: "Guyana",
      wca_id: "Guyana",
      continent_name: "South America"
    },
    %{
      iso2: "HT",
      name: "Haiti",
      wca_id: "Haiti",
      continent_name: "North America"
    },
    %{
      iso2: "HN",
      name: "Honduras",
      wca_id: "Honduras",
      continent_name: "North America"
    },
    %{
      iso2: "HK",
      name: "Hong Kong",
      wca_id: "Hong Kong",
      continent_name: "Asia"
    },
    %{
      iso2: "HU",
      name: "Hungary",
      wca_id: "Hungary",
      continent_name: "Europe"
    },
    %{
      iso2: "IS",
      name: "Iceland",
      wca_id: "Iceland",
      continent_name: "Europe"
    },
    %{
      iso2: "IN",
      name: "India",
      wca_id: "India",
      continent_name: "Asia"
    },
    %{
      iso2: "ID",
      name: "Indonesia",
      wca_id: "Indonesia",
      continent_name: "Asia"
    },
    %{
      iso2: "IR",
      name: "Iran",
      wca_id: "Iran",
      continent_name: "Asia"
    },
    %{
      iso2: "IQ",
      name: "Iraq",
      wca_id: "Iraq",
      continent_name: "Asia"
    },
    %{
      iso2: "IE",
      name: "Ireland",
      wca_id: "Ireland",
      continent_name: "Europe"
    },
    %{
      iso2: "IL",
      name: "Israel",
      wca_id: "Israel",
      continent_name: "Europe"
    },
    %{
      iso2: "IT",
      name: "Italy",
      wca_id: "Italy",
      continent_name: "Europe"
    },
    %{
      iso2: "JM",
      name: "Jamaica",
      wca_id: "Jamaica",
      continent_name: "North America"
    },
    %{
      iso2: "JP",
      name: "Japan",
      wca_id: "Japan",
      continent_name: "Asia"
    },
    %{
      iso2: "JO",
      name: "Jordan",
      wca_id: "Jordan",
      continent_name: "Asia"
    },
    %{
      iso2: "KZ",
      name: "Kazakhstan",
      wca_id: "Kazakhstan",
      continent_name: "Asia"
    },
    %{
      iso2: "KE",
      name: "Kenya",
      wca_id: "Kenya",
      continent_name: "Africa"
    },
    %{
      iso2: "KI",
      name: "Kiribati",
      wca_id: "Kiribati",
      continent_name: "Oceania"
    },
    %{
      iso2: "XK",
      name: "Kosovo",
      wca_id: "Kosovo",
      continent_name: "Europe"
    },
    %{
      iso2: "KW",
      name: "Kuwait",
      wca_id: "Kuwait",
      continent_name: "Asia"
    },
    %{
      iso2: "KG",
      name: "Kyrgyzstan",
      wca_id: "Kyrgyzstan",
      continent_name: "Asia"
    },
    %{
      iso2: "LA",
      name: "Laos",
      wca_id: "Laos",
      continent_name: "Asia"
    },
    %{
      iso2: "LV",
      name: "Latvia",
      wca_id: "Latvia",
      continent_name: "Europe"
    },
    %{
      iso2: "LB",
      name: "Lebanon",
      wca_id: "Lebanon",
      continent_name: "Asia"
    },
    %{
      iso2: "LS",
      name: "Lesotho",
      wca_id: "Lesotho",
      continent_name: "Africa"
    },
    %{
      iso2: "LR",
      name: "Liberia",
      wca_id: "Liberia",
      continent_name: "Africa"
    },
    %{
      iso2: "LY",
      name: "Libya",
      wca_id: "Libya",
      continent_name: "Africa"
    },
    %{
      iso2: "LI",
      name: "Liechtenstein",
      wca_id: "Liechtenstein",
      continent_name: "Europe"
    },
    %{
      iso2: "LT",
      name: "Lithuania",
      wca_id: "Lithuania",
      continent_name: "Europe"
    },
    %{
      iso2: "LU",
      name: "Luxembourg",
      wca_id: "Luxembourg",
      continent_name: "Europe"
    },
    %{
      iso2: "MO",
      name: "Macau",
      wca_id: "Macau",
      continent_name: "Asia"
    },
    %{
      iso2: "MG",
      name: "Madagascar",
      wca_id: "Madagascar",
      continent_name: "Africa"
    },
    %{
      iso2: "MW",
      name: "Malawi",
      wca_id: "Malawi",
      continent_name: "Africa"
    },
    %{
      iso2: "MY",
      name: "Malaysia",
      wca_id: "Malaysia",
      continent_name: "Asia"
    },
    %{
      iso2: "MV",
      name: "Maldives",
      wca_id: "Maldives",
      continent_name: "Asia"
    },
    %{
      iso2: "ML",
      name: "Mali",
      wca_id: "Mali",
      continent_name: "Africa"
    },
    %{
      iso2: "MT",
      name: "Malta",
      wca_id: "Malta",
      continent_name: "Europe"
    },
    %{
      iso2: "MH",
      name: "Marshall Islands",
      wca_id: "Marshall Islands",
      continent_name: "Oceania"
    },
    %{
      iso2: "MR",
      name: "Mauritania",
      wca_id: "Mauritania",
      continent_name: "Africa"
    },
    %{
      iso2: "MU",
      name: "Mauritius",
      wca_id: "Mauritius",
      continent_name: "Africa"
    },
    %{
      iso2: "MX",
      name: "Mexico",
      wca_id: "Mexico",
      continent_name: "North America"
    },
    %{
      iso2: "MD",
      name: "Moldova",
      wca_id: "Moldova",
      continent_name: "Europe"
    },
    %{
      iso2: "MC",
      name: "Monaco",
      wca_id: "Monaco",
      continent_name: "Europe"
    },
    %{
      iso2: "MN",
      name: "Mongolia",
      wca_id: "Mongolia",
      continent_name: "Asia"
    },
    %{
      iso2: "ME",
      name: "Montenegro",
      wca_id: "Montenegro",
      continent_name: "Europe"
    },
    %{
      iso2: "MA",
      name: "Morocco",
      wca_id: "Morocco",
      continent_name: "Africa"
    },
    %{
      iso2: "MZ",
      name: "Mozambique",
      wca_id: "Mozambique",
      continent_name: "Africa"
    },
    %{
      iso2: "MM",
      name: "Myanmar",
      wca_id: "Myanmar",
      continent_name: "Asia"
    },
    %{
      iso2: "NA",
      name: "Namibia",
      wca_id: "Namibia",
      continent_name: "Africa"
    },
    %{
      iso2: "NR",
      name: "Nauru",
      wca_id: "Nauru",
      continent_name: "Oceania"
    },
    %{
      iso2: "NP",
      name: "Nepal",
      wca_id: "Nepal",
      continent_name: "Asia"
    },
    %{
      iso2: "NL",
      name: "Netherlands",
      wca_id: "Netherlands",
      continent_name: "Europe"
    },
    %{
      iso2: "NZ",
      name: "New Zealand",
      wca_id: "New Zealand",
      continent_name: "Oceania"
    },
    %{
      iso2: "NI",
      name: "Nicaragua",
      wca_id: "Nicaragua",
      continent_name: "North America"
    },
    %{
      iso2: "NE",
      name: "Niger",
      wca_id: "Niger",
      continent_name: "Africa"
    },
    %{
      iso2: "NG",
      name: "Nigeria",
      wca_id: "Nigeria",
      continent_name: "Africa"
    },
    %{
      iso2: "MK",
      name: "North Macedonia",
      wca_id: "North Macedonia",
      continent_name: "Europe"
    },
    %{
      iso2: "NO",
      name: "Norway",
      wca_id: "Norway",
      continent_name: "Europe"
    },
    %{
      iso2: "OM",
      name: "Oman",
      wca_id: "Oman",
      continent_name: "Asia"
    },
    %{
      iso2: "PK",
      name: "Pakistan",
      wca_id: "Pakistan",
      continent_name: "Asia"
    },
    %{
      iso2: "PW",
      name: "Palau",
      wca_id: "Palau",
      continent_name: "Oceania"
    },
    %{
      iso2: "PS",
      name: "Palestine",
      wca_id: "Palestine",
      continent_name: "Asia"
    },
    %{
      iso2: "PA",
      name: "Panama",
      wca_id: "Panama",
      continent_name: "North America"
    },
    %{
      iso2: "PG",
      name: "Papua New Guinea",
      wca_id: "Papua New Guinea",
      continent_name: "Oceania"
    },
    %{
      iso2: "PY",
      name: "Paraguay",
      wca_id: "Paraguay",
      continent_name: "South America"
    },
    %{
      iso2: "PE",
      name: "Peru",
      wca_id: "Peru",
      continent_name: "South America"
    },
    %{
      iso2: "PH",
      name: "Philippines",
      wca_id: "Philippines",
      continent_name: "Asia"
    },
    %{
      iso2: "PL",
      name: "Poland",
      wca_id: "Poland",
      continent_name: "Europe"
    },
    %{
      iso2: "PT",
      name: "Portugal",
      wca_id: "Portugal",
      continent_name: "Europe"
    },
    %{
      iso2: "QA",
      name: "Qatar",
      wca_id: "Qatar",
      continent_name: "Asia"
    },
    %{
      iso2: "KR",
      name: "Republic of Korea",
      wca_id: "Korea",
      continent_name: "Asia"
    },
    %{
      iso2: "RO",
      name: "Romania",
      wca_id: "Romania",
      continent_name: "Europe"
    },
    %{
      iso2: "RU",
      name: "Russia",
      wca_id: "Russia",
      continent_name: "Europe"
    },
    %{
      iso2: "RW",
      name: "Rwanda",
      wca_id: "Rwanda",
      continent_name: "Africa"
    },
    %{
      iso2: "KN",
      name: "Saint Kitts and Nevis",
      wca_id: "Saint Kitts and Nevis",
      continent_name: "North America"
    },
    %{
      iso2: "LC",
      name: "Saint Lucia",
      wca_id: "Saint Lucia",
      continent_name: "North America"
    },
    %{
      iso2: "VC",
      name: "Saint Vincent and the Grenadines",
      wca_id: "Saint Vincent and the Grenadines",
      continent_name: "North America"
    },
    %{
      iso2: "WS",
      name: "Samoa",
      wca_id: "Samoa",
      continent_name: "Oceania"
    },
    %{
      iso2: "SM",
      name: "San Marino",
      wca_id: "San Marino",
      continent_name: "Europe"
    },
    %{
      iso2: "ST",
      name: "S\u00e3o Tom\u00e9 and Pr\u00edncipe",
      wca_id: "Sao Tome and Principe",
      continent_name: "Africa"
    },
    %{
      iso2: "SA",
      name: "Saudi Arabia",
      wca_id: "Saudi Arabia",
      continent_name: "Asia"
    },
    %{
      iso2: "SN",
      name: "Senegal",
      wca_id: "Senegal",
      continent_name: "Africa"
    },
    %{
      iso2: "RS",
      name: "Serbia",
      wca_id: "Serbia",
      continent_name: "Europe"
    },
    %{
      iso2: "SC",
      name: "Seychelles",
      wca_id: "Seychelles",
      continent_name: "Africa"
    },
    %{
      iso2: "SL",
      name: "Sierra Leone",
      wca_id: "Sierra Leone",
      continent_name: "Africa"
    },
    %{
      iso2: "SG",
      name: "Singapore",
      wca_id: "Singapore",
      continent_name: "Asia"
    },
    %{
      iso2: "SK",
      name: "Slovakia",
      wca_id: "Slovakia",
      continent_name: "Europe"
    },
    %{
      iso2: "SI",
      name: "Slovenia",
      wca_id: "Slovenia",
      continent_name: "Europe"
    },
    %{
      iso2: "SB",
      name: "Solomon Islands",
      wca_id: "Solomon Islands",
      continent_name: "Oceania"
    },
    %{
      iso2: "SO",
      name: "Somalia",
      wca_id: "Somalia",
      continent_name: "Africa"
    },
    %{
      iso2: "ZA",
      name: "South Africa",
      wca_id: "South Africa",
      continent_name: "Africa"
    },
    %{
      iso2: "SS",
      name: "South Sudan",
      wca_id: "South Sudan",
      continent_name: "Africa"
    },
    %{
      iso2: "ES",
      name: "Spain",
      wca_id: "Spain",
      continent_name: "Europe"
    },
    %{
      iso2: "LK",
      name: "Sri Lanka",
      wca_id: "Sri Lanka",
      continent_name: "Asia"
    },
    %{
      iso2: "SD",
      name: "Sudan",
      wca_id: "Sudan",
      continent_name: "Africa"
    },
    %{
      iso2: "SR",
      name: "Suriname",
      wca_id: "Suriname",
      continent_name: "South America"
    },
    %{
      iso2: "SE",
      name: "Sweden",
      wca_id: "Sweden",
      continent_name: "Europe"
    },
    %{
      iso2: "CH",
      name: "Switzerland",
      wca_id: "Switzerland",
      continent_name: "Europe"
    },
    %{
      iso2: "SY",
      name: "Syria",
      wca_id: "Syria",
      continent_name: "Asia"
    },
    %{
      iso2: "TW",
      name: "Taiwan",
      wca_id: "Taiwan",
      continent_name: "Asia"
    },
    %{
      iso2: "TJ",
      name: "Tajikistan",
      wca_id: "Tajikistan",
      continent_name: "Asia"
    },
    %{
      iso2: "TZ",
      name: "Tanzania",
      wca_id: "Tanzania",
      continent_name: "Africa"
    },
    %{
      iso2: "TH",
      name: "Thailand",
      wca_id: "Thailand",
      continent_name: "Asia"
    },
    %{
      iso2: "TL",
      name: "Timor-Leste",
      wca_id: "Timor-Leste",
      continent_name: "Asia"
    },
    %{
      iso2: "TG",
      name: "Togo",
      wca_id: "Togo",
      continent_name: "Africa"
    },
    %{
      iso2: "TO",
      name: "Tonga",
      wca_id: "Tonga",
      continent_name: "Oceania"
    },
    %{
      iso2: "TT",
      name: "Trinidad and Tobago",
      wca_id: "Trinidad and Tobago",
      continent_name: "North America"
    },
    %{
      iso2: "TN",
      name: "Tunisia",
      wca_id: "Tunisia",
      continent_name: "Africa"
    },
    %{
      iso2: "TR",
      name: "Turkey",
      wca_id: "Turkey",
      continent_name: "Europe"
    },
    %{
      iso2: "TM",
      name: "Turkmenistan",
      wca_id: "Turkmenistan",
      continent_name: "Asia"
    },
    %{
      iso2: "TV",
      name: "Tuvalu",
      wca_id: "Tuvalu",
      continent_name: "Oceania"
    },
    %{
      iso2: "UG",
      name: "Uganda",
      wca_id: "Uganda",
      continent_name: "Africa"
    },
    %{
      iso2: "UA",
      name: "Ukraine",
      wca_id: "Ukraine",
      continent_name: "Europe"
    },
    %{
      iso2: "AE",
      name: "United Arab Emirates",
      wca_id: "United Arab Emirates",
      continent_name: "Asia"
    },
    %{
      iso2: "GB",
      name: "United Kingdom",
      wca_id: "United Kingdom",
      continent_name: "Europe"
    },
    %{
      iso2: "US",
      name: "United States",
      wca_id: "USA",
      continent_name: "North America"
    },
    %{
      iso2: "UY",
      name: "Uruguay",
      wca_id: "Uruguay",
      continent_name: "South America"
    },
    %{
      iso2: "UZ",
      name: "Uzbekistan",
      wca_id: "Uzbekistan",
      continent_name: "Asia"
    },
    %{
      iso2: "VU",
      name: "Vanuatu",
      wca_id: "Vanuatu",
      continent_name: "Oceania"
    },
    %{
      iso2: "VA",
      name: "Vatican City",
      wca_id: "Vatican City",
      continent_name: "Europe"
    },
    %{
      iso2: "VE",
      name: "Venezuela",
      wca_id: "Venezuela",
      continent_name: "South America"
    },
    %{
      iso2: "VN",
      name: "Vietnam",
      wca_id: "Vietnam",
      continent_name: "Asia"
    },
    %{
      iso2: "YE",
      name: "Yemen",
      wca_id: "Yemen",
      continent_name: "Asia"
    },
    %{
      iso2: "ZM",
      name: "Zambia",
      wca_id: "Zambia",
      continent_name: "Africa"
    },
    %{
      iso2: "ZW",
      name: "Zimbabwe",
      wca_id: "Zimbabwe",
      continent_name: "Africa"
    }
  ]

  @doc """
  Finds a country with matching ISO2 code.

  Raises an error if no country is found.
  """
  @spec get_by_iso2!(String.t()) :: t()
  def get_by_iso2!(iso2) do
    @country_attrs
    |> Enum.find(fn country -> country.iso2 == iso2 end)
    |> case do
      nil ->
        raise ArgumentError, message: "invalid country iso2 code '#{iso2}'"

      attrs ->
        struct(__MODULE__, attrs)
    end
  end

  @doc """
  Finds a country with matching WCA id.

  Raises an error if no country is found.
  """
  @spec get_by_wca_id!(String.t()) :: t()
  def get_by_wca_id!(wca_id) do
    @country_attrs
    |> Enum.find(fn country -> country.wca_id == wca_id end)
    |> case do
      nil ->
        raise ArgumentError, message: "invalid country WCA id '#{wca_id}'"

      attrs ->
        struct(__MODULE__, attrs)
    end
  end
end
