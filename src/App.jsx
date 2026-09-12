import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════
const T = {
  green: "#1a6b3c", lime: "#5cb85c", gold: "#f0a500",
  earth: "#7a5c3a", cream: "#f7f3ec", dark: "#0f1f0f",
  sky: "#e6f4ea", fog: "#f2ede6", rust: "#c0392b",
  blue: "#1565c0", card: "#ffffff",
  shadow: "0 4px 28px rgba(26,107,60,0.12)",
  shadowHover: "0 8px 36px rgba(26,107,60,0.22)",
};

const TR_DICT = {
  // CropTab
  "Crop Advisor": { Hindi:"फसल सलाहकार", Tamil:"பயிர் ஆலோசகர்", Telugu:"పంట సలహాదారు", Kannada:"ಬೆಳೆ ಸಲಹೆಗಾರ", Malayalam:"വിള ഉപദേശകൻ" },
  "Get personalized crop recommendations for your farm.": { Hindi:"अपने खेत के लिए व्यक्तिगत फसल सिफारिशें प्राप्त करें।", Tamil:"உங்கள் பண்ணைக்கு தனிப்பயனாக்கப்பட்ட பயிர் பரிந்துரைகளை பெறவும்.", Telugu:"మీ పొలానికి వ్యక్తిగతీకరించిన పంట సూచనలను పొందండి.", Kannada:"ನಿಮ್ಮ ಜಮೀನಿಗೆ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ.", Malayalam:"നിങ്ങളുടെ കൃഷിയിടത്തിന് വ്യക്തിഗതമാക്കിയ വിള നിർദ്ദേശങ്ങൾ നേടുക." },
  "🗺 Your Farm Details": { Hindi:"🗺 आपके खेत का विवरण", Tamil:"🗺 உங்கள் பண்ணை விவரங்கள்", Telugu:"🗺 మీ పొలం వివరాలు", Kannada:"🗺 ನಿಮ್ಮ ಜಮೀನಿನ ವಿವರಗಳು", Malayalam:"🗺 നിങ്ങളുടെ കൃഷിയിടത്തിൻ്റെ വിശദാംശങ്ങൾ" },
  "District *": { Hindi:"जिला *", Tamil:"மாவட்டம் *", Telugu:"జిల్లా *", Kannada:"ಜಿಲ್ಲೆ *", Malayalam:"ജില്ല *" },
  "Soil Type *": { Hindi:"मिट्टी का प्रकार *", Tamil:"மண் வகை *", Telugu:"నేల రకం *", Kannada:"ಮಣ್ಣಿನ ಪ್ರಕಾರ *", Malayalam:"മണ്ണ് തരം *" },
  "Season *": { Hindi:"मौसम *", Tamil:"பருவம் *", Telugu:"సీజన్ *", Kannada:"ಋತು *", Malayalam:"സീസൺ *" },
  "Water Source *": { Hindi:"जल स्रोत *", Tamil:"நீர் ஆதாரம் *", Telugu:"నీటి వనరు *", Kannada:"ನೀರಿನ ಮೂಲ *", Malayalam:"ജലസ്രോതസ്സ് *" },
  "Select…": { Hindi:"चुनें...", Tamil:"தேர்ந்தெடு...", Telugu:"ఎంచుకోండి...", Kannada:"ಆಯ್ಕೆಮಾಡಿ...", Malayalam:"തിരഞ്ഞെടുക്കുക..." },
  "🔍 Analyzing your land…": { Hindi:"🔍 आपकी भूमि का विश्लेषण कर रहे हैं...", Tamil:"🔍 உங்கள் நிலத்தை பகுப்பாய்வு செய்கிறது...", Telugu:"🔍 మీ భూమిని విశ్లేషిస్తోంది...", Kannada:"🔍 ನಿಮ್ಮ ಭೂಮಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...", Malayalam:"🔍 നിങ്ങളുടെ ഭൂമി വിശകലനം ചെയ്യുന്നു..." },
  "🔍 Get Crop Recommendations": { Hindi:"🔍 फसल सिफारिशें प्राप्त करें", Tamil:"🔍 பயிர் பரிந்துரைகளை பெறுக", Telugu:"🔍 పంట సూచనలను పొందండి", Kannada:"🔍 ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ", Malayalam:"🔍 വിള നിർദ്ദേശങ്ങൾ നേടുക" },
  "⭐ Best Choice": { Hindi:"⭐ सर्वोत्तम विकल्प", Tamil:"⭐ சிறந்த தேர்வு", Telugu:"⭐ ఉత్తమ ఎంపిక", Kannada:"⭐ ಅತ್ಯುತ್ತಮ ಆಯ್ಕೆ", Malayalam:"⭐ മികച്ച തിരഞ്ഞെടുപ്പ്" },
  "💰 Profit Estimate": { Hindi:"💰 लाभ अनुमान", Tamil:"💰 இலாப மதிப்பீடு", Telugu:"💰 లాభాల అంచనా", Kannada:"💰 ಲಾಭದ ಅಂದಾಜು", Malayalam:"💰 ലാഭ കണക്കുകൂട്ടൽ" },

  // MarketTab
  "Live Market Prices": { Hindi:"लाइव मार्केट मूल्य", Tamil:"நேரடி சந்தை விலைகள்", Telugu:"ప్రత్యక్ష మార్కెట్ ధరలు", Kannada:"ನೇರ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು", Malayalam:"തത്സമയ വിപണി വിലകൾ" },
  "Today's mandi prices — updated 6:00 AM": { Hindi:"आज के मंडी भाव — सुबह 6:00 बजे अपडेट किए गए", Tamil:"இன்றைய மண்டி விலைகள் — காலை 6:00 மணிக்கு புதுப்பிக்கப்பட்டது", Telugu:"నేటి మండి ధరలు — ఉదయం 6:00 గంటలకు అప్‌డేట్ చేయబడింది", Kannada:"ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು — ಬೆಳಿಗ್ಗೆ 6:00 ಕ್ಕೆ ನವೀಕರಿಸಲಾಗಿದೆ", Malayalam:"ഇന്നത്തെ വിപണി വിലകൾ — രാവിലെ 6:00 മണിക്ക് അപ്ഡേറ്റ് ചെയ്തു" },
  "All": { Hindi:"सभी", Tamil:"அனைத்தும்", Telugu:"అన్నీ", Kannada:"ಎಲ್ಲಾ", Malayalam:"എല്ലാം" },
  "🌾 Grain": { Hindi:"🌾 अनाज", Tamil:"🌾 தானியம்", Telugu:"🌾 ధాన్యం", Kannada:"🌾 ಧಾನ್ಯ", Malayalam:"🌾 ധാന്യം" },
  "🥦 Veggie": { Hindi:"🥦 सब्जियां", Tamil:"🥦 காய்கறிகள்", Telugu:"🥦 కూరగాయలు", Kannada:"🥦 ತರಕಾರಿಗಳು", Malayalam:"🥦 പച്ചക്കറികൾ" },
  "🍌 Fruit": { Hindi:"🍌 फल", Tamil:"🍌 பழம்", Telugu:"🍌 పండు", Kannada:"🍌 ಹಣ್ಣು", Malayalam:"🍌 പഴം" },
  "🌶 Spice": { Hindi:"🌶 मसाले", Tamil:"🌶 மசாலா", Telugu:"🌶 మసాలా", Kannada:"🌶 ಮಸಾಲೆ", Malayalam:"🌶 സുഗന്ധവ്യഞ്ജനങ്ങൾ" },
  "📈 Rising": { Hindi:"📈 बढ़ रहा है", Tamil:"📈 உயர்கிறது", Telugu:"📈 పెరుగుతోంది", Kannada:"📈 ಏರುತ್ತಿದೆ", Malayalam:"📈 വർദ്ധിക്കുന്നു" },
  "📉 Falling": { Hindi:"📉 गिर रहा है", Tamil:"📉 குறைகிறது", Telugu:"📉 పడిపోతోంది", Kannada:"📉 ಕುಸಿಯುತ್ತಿದೆ", Malayalam:"📉 കുറയുന്നു" },
  
  // WeatherTab
  "Weather & Farm Alerts": { Hindi:"मौसम और कृषि अलर्ट", Tamil:"வானிலை மற்றும் பண்ணை எச்சரிக்கைகள்", Telugu:"వాతావరణం మరియు వ్యవసాయ హెచ్చரிக்கలు", Kannada:"ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಎಚ್ಚರಿಕೆಗಳು", Malayalam:"കാലാവസ്ഥയും കാർഷിക മുന്നറിയിപ്പുകളും" },
  "Live forecast and smart farming tips.": { Hindi:"लाइव पूर्वानुमान और स्मार्ट खेती के सुझाव।", Tamil:"நேரடி முன்னறிவிப்பு மற்றும் ஸ்மார்ட் விவசாய குறிப்புகள்.", Telugu:"ప్రత్యక్ష సూచన మరియు స్మార్ట్ వ్యవసాయ చిట్కాలు.", Kannada:"ನೇರ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಲಹೆಗಳು.", Malayalam:"തത്സമയ കാലാവസ്ഥാ പ്രവചനവും സ്മാർട്ട് കൃഷി നുറുങ്ങുകളും." },

  // SchemesTab
  "Govt Schemes (DBT)": { Hindi:"सरकारी योजनाएं (DBT)", Tamil:"அரசு திட்டங்கள் (DBT)", Telugu:"ప్రభుత్వ పథకాలు (DBT)", Kannada:"ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು (DBT)", Malayalam:"സർക്കാർ പദ്ധതികൾ (DBT)" },
  "Find and apply for grants & subsidies.": { Hindi:"अनुदान और सब्सिडी खोजें और लागू करें।", Tamil:"மானியங்கள் மற்றும் மானியங்களை தேடி விண்ணப்பிக்கவும்.", Telugu:"గ్రాంట్లు మరియు సబ్సిడీలను కనుగొని దరఖాస్తు చేయండి.", Kannada:"ಅನುದಾನ ಮತ್ತು ಸಹಾಯಧನಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ಅನ್ವಯಿಸಿ.", Malayalam:"ഗ്രാൻ്റുകൾക്കും സബ്സിഡികൾക്കുമായി തിരയുകയും അപേക്ഷിക്കുകയും ചെയ്യുക." },
  
  // DemandTab
  "Post Your Demand": { Hindi:"अपनी मांग पोस्ट करें", Tamil:"உங்கள் தேவையை பதிவிடவும்", Telugu:"మీ డిమాండ్‌ను పోస్ట్ చేయండి", Kannada:"ನಿಮ್ಮ ಬೇಡಿಕೆಯನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ", Malayalam:"നിങ്ങളുടെ ആവശ്യം പോസ്റ്റ് ചെയ്യുക" },
  "Let farmers know what crop waste you need.": { Hindi:"किसानों को बताएं कि आपको कौन सा फसल कचरा चाहिए।", Tamil:"உங்களுக்கு என்ன பயிர் கழிவு தேவை என்பதை விவசாயிகளுக்கு தெரியப்படுத்துங்கள்.", Telugu:"మీకు ఏ పంట వ్యర్థాలు కావాలో రైతులకు తెలియజేయండి.", Kannada:"ನಿಮಗೆ ಯಾವ ಬೆಳೆ ತ್ಯಾಜ್ಯ ಬೇಕು ಎಂದು ರೈತರಿಗೆ ತಿಳಿಸಿ.", Malayalam:"നിങ്ങൾക്ക് ഏത് വിള മാലിന്യമാണ് വേണ്ടതെന്ന് കർഷകരെ അറിയിക്കുക." },
  "📢 Post Demand to Farmers": { Hindi:"📢 किसानों को मांग पोस्ट करें", Tamil:"📢 விவசாயிகளுக்கு தேவையை பதிவிடவும்", Telugu:"📢 రైతులకు డిమాండ్‌ను పోస్ట్ చేయండి", Kannada:"📢 ರೈತರಿಗೆ ಬೇಡಿಕೆಯನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ", Malayalam:"📢 കർഷകർക്ക് ആവശ്യം പോസ്റ്റ് ചെയ്യുക" },
  "Demand Posted!": { Hindi:"मांग पोस्ट की गई!", Tamil:"தேவை பதிவிடப்பட்டது!", Telugu:"డిమాండ్ పోస్ట్ చేయబడింది!", Kannada:"ಬೇಡಿಕೆ ಪೋಸ್ಟ್ ಮಾಡಲಾಗಿದೆ!", Malayalam:"ആവശ്യം പോസ്റ്റ് ചെയ്തു!" },

  // CalcTab
  "Profit Calculator": { Hindi:"लाभ कैलकुलेटर", Tamil:"இலாப கால்குலேட்டர்", Telugu:"లాభాల కాలిక్యులేటర్", Kannada:"ಲಾಭದ ಕ್ಯಾಲ್ಕುಲೇಟರ್", Malayalam:"ലാഭ കാൽക്കുലേറ്റർ" },
  "Estimate your earnings from selling crop waste.": { Hindi:"फसल कचरा बेचने से अपनी कमाई का अनुमान लगाएं।", Tamil:"பயிர் கழிவுகளை விற்பதன் மூலம் உங்கள் வருமானத்தை மதிப்பிடுங்கள்.", Telugu:"పంట వ్యర్థాలను అమ్మడం ద్వారా మీ ఆదాయాన్ని అంచనా వేయండి.", Kannada:"ಬೆಳೆ ತ್ಯಾಜ್ಯವನ್ನು ಮಾರಾಟ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಗಳಿಕೆಯನ್ನು ಅಂದಾಜು ಮಾಡಿ.", Malayalam:"വിള മാലിന്യം വിൽക്കുന്നതിലൂടെ നിങ്ങളുടെ വരുമാനം കണക്കാക്കുക." },
  "Waste Type": { Hindi:"कचरे का प्रकार", Tamil:"கழிவு வகை", Telugu:"వ్యర్థాల రకం", Kannada:"ತ್ಯಾಜ್ಯದ ಪ್ರಕಾರ", Malayalam:"മാലിന്യ തരം" },
  "Quantity (Tonnes)": { Hindi:"मात्रा (टन)", Tamil:"அளவு (டன்கள்)", Telugu:"పరిమాణం (టన్నులు)", Kannada:"ಪ್ರಮಾಣ (ಟನ್)", Malayalam:"അളവ് (ടൺ)" },
  "Location": { Hindi:"स्थान", Tamil:"இடம்", Telugu:"స్థానం", Kannada:"ಸ್ಥಳ", Malayalam:"സ്ഥലം" },
  "Calculated Earnings": { Hindi:"अनुमानित कमाई", Tamil:"கணக்கிடப்பட்ட வருமானம்", Telugu:"లెక్కించిన ఆదాయాలు", Kannada:"ಲೆಕ್ಕ ಹಾಕಿದ ಗಳಿಕೆಗಳು", Malayalam:"കണക്കാക്കിയ വരുമാനം" }
};

const DATA_DICT = {
  'Paddy Straw': { Hindi: 'धान का पुआल', Tamil: 'நெற்பயிர் வைக்கோல்', Telugu: 'వరి గడ్డి', Kannada: 'ಭತ್ತದ ಹುಲ್ಲು', Malayalam: 'നെല്ല് വൈക്കോൽ' },
  'Sugarcane Bagasse': { Hindi: 'गन्ने की खोई', Tamil: 'கரும்பு சக்கை', Telugu: 'చెరకు పిప్పి', Kannada: 'ಕಬ್ಬಿನ ಸಿಪ್ಪೆ', Malayalam: 'കരിമ്പ് ചണ്ടി' },
  'Corn Husk': { Hindi: 'मक्के का छिलका', Tamil: 'சோள உமி', Telugu: 'మొక్కజొన్న పొట్టు', Kannada: 'ಜೋಳದ ಸಿಪ್ಪೆ', Malayalam: 'ചോളം തൊണ്ട്' },
  'Cotton Stalks': { Hindi: 'कपास के डंठल', Tamil: 'பருத்தி தண்டுகள்', Telugu: 'పత్తి కాడలు', Kannada: 'ಹತ್ತಿ ಕಾಂಡಗಳು', Malayalam: 'പരുത്തി തണ്ടുകൾ' },
  'Coconut Husk': { Hindi: 'नारियल की जटा', Tamil: 'தேங்காய் நார்', Telugu: 'కొబ్బరి పీచు', Kannada: 'ತೆಂಗಿನ ಸಿಪ್ಪೆ', Malayalam: 'തേങ്ങ തൊണ്ട്' },
  'Rice Bran': { Hindi: 'चावल की भूसी', Tamil: 'தவிடு', Telugu: 'తవుడు', Kannada: 'ಅಕ್ಕಿ ತೌಡು', Malayalam: 'തവിട്' },
  'Banana Stem/Peel': { Hindi: 'केले का तना/छिलका', Tamil: 'வாழைத்தண்டு/தோல்', Telugu: 'అరటి కాండం/తొక్క', Kannada: 'ಬಾಳೆ ದಿಂಡು', Malayalam: 'വാഴപ്പിണ്ടി/തൊലി' },
  'Groundnut Shells': { Hindi: 'मूंगफली के छिलके', Tamil: 'நிலக்கடலை ஓடு', Telugu: 'వేరుశెనగ పొట్టు', Kannada: 'ಕಡಲೆಕಾಯಿ ಸಿಪ್ಪೆ', Malayalam: 'നിലക്കടല തോട്' },

  'Bioenergy': { Hindi: 'बायोएनर्जी', Tamil: 'உயிரி ஆற்றல்', Telugu: 'బయోఎనర్జీ', Kannada: 'ಜೈವಿಕ ಶಕ್ತಿ', Malayalam: 'ബയോഎനർജി' },
  'Fertilizer': { Hindi: 'उर्वरक', Tamil: 'உரம்', Telugu: 'ఎరువులు', Kannada: 'ರಸಗೊಬ್ಬರ', Malayalam: 'വളം' },
  'Packaging': { Hindi: 'पैकेजिंग', Tamil: 'பேக்கேஜிங்', Telugu: 'ప్యాకేజింగ్', Kannada: 'ಪ್ಯಾಕೇಜಿಂಗ್', Malayalam: 'പാക്കേജിംഗ്' },
  'Paper': { Hindi: 'कागज़', Tamil: 'காகிதம்', Telugu: 'కాగితం', Kannada: 'ಕಾಗದ', Malayalam: 'കടലാസ്' },
  'Food Processing': { Hindi: 'खाद्य प्रसंस्करण', Tamil: 'உணவு பதப்படுத்துதல்', Telugu: 'ఆహార ప్రాసెసింగ్', Kannada: 'ಆಹಾರ ಸಂಸ್ಕರಣೆ', Malayalam: 'ഭക്ഷ്യ സംസ്കരണം' },
  'Textile': { Hindi: 'कपड़ा', Tamil: 'ஜவுளி', Telugu: 'టెక్స్‌టైల్', Kannada: 'ಜವಳಿ', Malayalam: 'ടെക്സ്റ്റൈൽ' },
  'Activated Carbon': { Hindi: 'सक्रिय कार्बन', Tamil: 'செயல்படுத்தப்பட்ட கார்பன்', Telugu: 'యాక్టివేటెడ్ కార్బన్', Kannada: 'ಸಕ್ರಿಯ ಇಂಗಾಲ', Malayalam: 'ആക്ടിവേറ്റഡ് കാർബൺ' },
  'Handicrafts': { Hindi: 'हस्तशिल्प', Tamil: 'கைவினைப் பொருட்கள்', Telugu: 'హస్తకళలు', Kannada: 'ಕರಕುಶಲ ವಸ್ತುಗಳು', Malayalam: 'കരകൗശലവസ്തുക്കൾ' },
  'Cosmetics': { Hindi: 'सौंदर्य प्रसाधन', Tamil: 'அழகுசாதன பொருட்கள்', Telugu: 'సౌందర్య సాధనాలు', Kannada: 'ಸೌಂದರ್ಯವರ್ಧಕಗಳು', Malayalam: 'സൗന്ദര്യവർദ്ധകവസ്തുക്കൾ' },
  'Oil Extraction': { Hindi: 'तेल निकालना', Tamil: 'எண்ணெய் பிரித்தெடுத்தல்', Telugu: 'నూనె వెలికితీత', Kannada: 'ತೈಲ ಹೊರತೆಗೆಯುವಿಕೆ', Malayalam: 'എണ്ണ വേർതിരിക്കൽ' },
  'Animal Feed': { Hindi: 'पशु चारा', Tamil: 'கால்நடை தீவனம்', Telugu: 'పశుగ్రాసం', Kannada: 'ಪಶು ಆಹಾರ', Malayalam: 'കാലിത്തീറ്റ' },
  'Particle Board': { Hindi: 'पार्टिकल बोर्ड', Tamil: 'பார்ட்டிக்கிள் போர்டு', Telugu: 'పార్టికల్ బోర్డ్', Kannada: 'ಪಾರ್ಟಿಕಲ್ ಬೋರ್ಡ್', Malayalam: 'പാർട്ടിക്കിൾ ബോർഡ്' },
  'Pharma': { Hindi: 'फार्मा', Tamil: 'பார்மா', Telugu: 'ఫార్మా', Kannada: 'ಫಾರ್ಮಾ', Malayalam: 'ഫാർമ' },
  'Textile Fiber': { Hindi: 'टेक्सटाइल फाइबर', Tamil: 'ஜவுளி நார்', Telugu: 'టెక్స్‌టైల్ ఫైబర్', Kannada: 'ಜವಳಿ ನಾರು', Malayalam: 'ടെക്സ്റ്റൈൽ ഫൈബർ' },

  'PM Kisan Samman Nidhi': { Hindi: 'पीएम किसान सम्मान निधि', Tamil: 'பிஎம் கிசான் சம்மான் நிதி', Telugu: 'పీఎం కిసాన్ సమ్మాన్ నిధి', Kannada: 'ಪಿಎಂ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ', Malayalam: 'പിഎം കിസാൻ സമ്മാൻ നിധി' },
  '₹6,000/year Direct Transfer': { Hindi: '₹6,000/वर्ष सीधा हस्तांतरण', Tamil: 'ஆண்டுக்கு ₹6,000 நேரடி பரிமாற்றம்', Telugu: 'సంవత్సరానికి ₹6,000 ప్రత్యక్ష బదిలీ', Kannada: 'ವರ್ಷಕ್ಕೆ ₹6,000 ನೇರ ವರ್ಗಾವಣೆ', Malayalam: 'പ്രതിവർഷം ₹6,000 നേരിട്ടുള്ള കൈമാറ്റം' },
  'Direct income support to small and marginal farmers in three installments.': { Hindi: 'छोटे और सीमांत किसानों को तीन किस्तों में सीधी आय सहायता।', Tamil: 'சிறு மற்றும் குறு விவசாயிகளுக்கு மூன்று தவணைகளில் நேரடி வருமான ஆதரவு.', Telugu: 'సన్నకారు రైతులకు మూడు విడతలుగా ప్రత్యక్ష ఆదాయ మద్దతు.', Kannada: 'ಸಣ್ಣ ರೈತರಿಗೆ ಮೂರು ಕಂತುಗಳಲ್ಲಿ ನೇರ ಆದಾಯ ಬೆಂಬಲ.', Malayalam: 'ചെറുകിട കർഷകർക്ക് മൂന്ന് ഗഡുക്കളായി വരുമാന പിന്തുണ.' },
  
  'PM Fasal Bima Yojana': { Hindi: 'पीएम फसल बीमा योजना', Tamil: 'பிஎம் பயிர் காப்பீட்டு திட்டம்', Telugu: 'పీఎం ఫసల్ బీమా యోజన', Kannada: 'ಪಿಎಂ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ', Malayalam: 'പിഎം ഫസൽ ബീമാ യോജന' },
  'Up to ₹2 Lakh Insurance': { Hindi: '₹2 लाख तक का बीमा', Tamil: '₹2 லட்சம் வரை காப்பீடு', Telugu: '₹2 లక్షల వరకు బీమా', Kannada: '₹2 ಲಕ್ಷದವರೆಗೆ ವಿಮೆ', Malayalam: '₹2 ലക്ഷം വരെ ഇൻഷുറൻസ്' },
  "Crop insurance providing financial support for crop loss due to unforeseen events.": { Hindi: 'अप्रत्याशित घटनाओं के कारण फसल नुकसान के लिए वित्तीय सहायता प्रदान करने वाला फसल बीमा।', Tamil: 'எதிர்பாராத நிகழ்வுகளால் பயிர் இழப்புக்கு நிதி உதவி வழங்கும் பயிர் காப்பீடு.', Telugu: 'అనుకోని సంఘటనల వల్ల పంట నష్టానికి ఆర్థిక సహాయం అందించే పంట బీమా.', Kannada: 'ಅನಿರೀಕ್ಷಿತ ಘಟನೆಗಳಿಂದ ಬೆಳೆ ನಷ್ಟಕ್ಕೆ ಆರ್ಥಿಕ ಬೆಂಬಲ ನೀಡುವ ಬೆಳೆ ವಿಮೆ.', Malayalam: 'അപ്രതീക്ഷിത സംഭവങ്ങൾ മൂലമുള്ള വിളനാശത്തിന് സാമ്പത്തിക സഹായം നൽകുന്ന വിള ഇൻഷുറൻസ്.' },

  'PM Krishi Sinchayee Yojana': { Hindi: 'पीएम कृषि सिंचाई योजना', Tamil: 'பிஎம் கிரிஷி சிஞ்சாயி திட்டம்', Telugu: 'పీఎం కృషి సించాయీ యోజన', Kannada: 'ಪಿಎಂ ಕೃಷಿ ಸಿಂಚಾಯಿ ಯೋಜನೆ', Malayalam: 'പിഎം കൃഷി സിഞ്ചായി യോജന' },
  '55–90% Subsidy on Drip': { Hindi: 'ड्रिप पर 55-90% सब्सिडी', Tamil: 'சொட்டுநீர்ப்பாசனத்திற்கு 55-90% மானியம்', Telugu: 'డ్రిప్ పై 55-90% సబ్సిడీ', Kannada: 'ಹನಿ ನೀರಾವರಿಗೆ 55-90% ಸಬ್ಸಿಡಿ', Malayalam: 'ഡ്രിപ്പിന് 55-90% സബ്സിഡി' },
  "Subsidy on drip and sprinkler irrigation to reduce water usage and increase productivity.": { Hindi: 'पानी के उपयोग को कम करने और उत्पादकता बढ़ाने के लिए ड्रिप और स्प्रिंकलर सिंचाई पर सब्सिडी।', Tamil: 'நீர் பயன்பாட்டைக் குறைக்கவும் உற்பத்தித் திறனை அதிகரிக்கவும் சொட்டுநீர் மற்றும் தெளிப்பான்களுக்கு மானியம்.', Telugu: 'నీటి వినియోగాన్ని తగ్గించడానికి మరియు ఉత్పాదకతను పెంచడానికి డ్రిప్ మరియు స్ప్రింక్లర్ నీటిపారుదలపై సబ్సిడీ.', Kannada: 'ನೀರಿನ ಬಳಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಮತ್ತು ಉತ್ಪಾದಕತೆಯನ್ನು ಹೆಚ್ಚಿಸಲು ಹನಿ ಮತ್ತು ತುಂತುರು ನೀರಾವರಿಗೆ ಸಬ್ಸಿಡಿ.', Malayalam: 'ജല ഉപയോഗം കുറയ്ക്കാനും ഉൽപാദനക്ഷമത വർദ്ധിപ്പിക്കാനും ഡ്രിപ്പ്, സ്പ്രിംഗ്ലർ ജലസേചനത്തിന് സബ്സിഡി.' },

  'Kisan Credit Card (KCC)': { Hindi: 'किसान क्रेडिट कार्ड (KCC)', Tamil: 'கிசான் கிரெடிட் கார்டு (KCC)', Telugu: 'కిసాన్ క్రెడిట్ కార్డ్ (KCC)', Kannada: 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC)', Malayalam: 'കിസാൻ ക്രെഡിట్ കാർഡ് (KCC)' },
  '4% Interest Rate Loan': { Hindi: '4% ब्याज दर ऋण', Tamil: '4% வட்டி விகிதக் கடன்', Telugu: '4% వడ్డీ రేటు రుణం', Kannada: '4% ಬಡ್ಡಿ ದರ ಸಾಲ', Malayalam: '4% പലിശ നിരക്ക് വായ്പ' },
  "Credit facility for agricultural needs including purchase of inputs at lower rates.": { Hindi: 'कम दरों पर इनपुट की खरीद सहित कृषि आवश्यकताओं के लिए ऋण सुविधा।', Tamil: 'குறைந்த விலையில் இடுபொருட்களை வாங்குவது உட்பட விவசாயத் தேவைகளுக்கான கடன் வசதி.', Telugu: 'తక్కువ రేట్లకు ఇన్‌పుట్‌ల కొనుగోలుతో సహా వ్యవసాయ అవసరాలకు రుణ సదుపాయం.', Kannada: 'ಕಡಿಮೆ ದರದಲ್ಲಿ ಇನ್ಪುಟ್ಗಳ ಖರೀದಿಯೊಂದಿಗೆ ಕೃಷಿ ಅಗತ್ಯಗಳಿಗೆ ಸಾಲ ಸೌಲಭ್ಯ.', Malayalam: 'കുറഞ്ഞ നിരക്കിൽ ഇൻപുട്ടുകൾ വാങ്ങുന്നത് ഉൾപ്പെടെ കാർഷിക ആവശ്യങ്ങൾക്കുള്ള വായ്പാ സൗകര്യം.' },

  'Agricultural Mechanization': { Hindi: 'कृषि मशीनीकरण', Tamil: 'விவசாய இயந்திரமயமாக்கல்', Telugu: 'వ్యవసాయ యాంత్రీకరణ', Kannada: 'ಕೃಷಿ ಯಾಂತ್ರೀಕರಣ', Malayalam: 'കാർഷിക യന്ത്രവൽക്കരണം' },
  '40–50% Subsidy on Machinery': { Hindi: 'मशीनरी पर 40-50% सब्सिडी', Tamil: 'இயந்திரங்களுக்கு 40-50% மானியம்', Telugu: 'యంత్రాలపై 40-50% సబ్సిడీ', Kannada: 'ಯಂತ್ರೋಪಕರಣಗಳ ಮೇಲೆ 40-50% ಸಬ್ಸಿಡಿ', Malayalam: 'യന്ത്രങ്ങൾക്ക് 40-50% സബ്സിഡി' },
  "Subsidy for purchase of farm machinery for small and marginal farmers.": { Hindi: 'छोटे और सीमांत किसानों के लिए कृषि मशीनरी की खरीद पर सब्सिडी।', Tamil: 'சிறு மற்றும் குறு விவசாயிகளுக்கு பண்ணை இயந்திரங்கள் வாங்க மானியம்.', Telugu: 'సన్నకారు మరియు సన్నకారు రైతులకు వ్యవసాయ యంత్రాల కొనుగోలుకు సబ్సిడీ.', Kannada: 'ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರಿಗೆ ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳ ಖರೀದಿಗೆ ಸಬ್ಸಿಡಿ.', Malayalam: 'ചെറുകിട, നാമമാത്ര കർഷകർക്ക് കാർഷിക യന്ത്രങ്ങൾ വാങ്ങുന്നതിനുള്ള സബ്സിഡി.' },

  'Paramparagat Krishi Vikas': { Hindi: 'परंपरागत कृषि विकास', Tamil: 'பாரம்பரிய விவசாய மேம்பாடு', Telugu: 'పరంపరాగత్ కృషి వికాస్', Kannada: 'ಪರಂಪರಾಗತ್ ಕೃಷಿ ವಿಕಾಸ್', Malayalam: 'പരമ്പരാഗത് കൃഷി വികാസ്' },
  '₹50,000/hectare Support': { Hindi: '₹50,000/हेक्टेयर सहायता', Tamil: '₹50,000/ஹெக்டேர் ஆதரவு', Telugu: '₹50,000/హెక్టారు మద్దతు', Kannada: '₹50,000/ಹೆಕ್ಟೇರ್ ಬೆಂಬಲ', Malayalam: '₹50,000/ഹെക്ടർ പിന്തുണ' },
  "Support for organic farming including certification and marketing support.": { Hindi: 'प्रमाणन और विपणन सहायता सहित जैविक खेती के लिए सहायता।', Tamil: 'சான்றிதழ் மற்றும் சந்தைப்படுத்தல் ஆதரவு உட்பட இயற்கை விவசாயத்திற்கான ஆதரவு.', Telugu: 'ధృవీకరణ మరియు మార్కెటింగ్ మద్దతుతో సహా సేంద్రీయ వ్యవసాయానికి మద్దతు.', Kannada: 'ಪ್ರಮಾಣೀಕರಣ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಂಬಲದೊಂದಿಗೆ ಸಾವಯವ ಕೃಷಿಗೆ ಬೆಂಬಲ.', Malayalam: 'സർട്ടിഫിക്കേഷനും മാർക്കറ്റിംഗ് പിന്തുണയും ഉൾപ്പെടെ ജൈവകൃഷിക്കുള്ള പിന്തുണ.' },

  'Today': { Hindi: 'आज', Tamil: 'இன்று', Telugu: 'ఈరోజు', Kannada: 'ಇಂದು', Malayalam: 'ഇന്ന്' },
  'Tue': { Hindi: 'मंगल', Tamil: 'செவ்வாய்', Telugu: 'మంగళ', Kannada: 'ಮಂಗಳ', Malayalam: 'ചൊവ്വ' },
  'Wed': { Hindi: 'बुध', Tamil: 'புதன்', Telugu: 'బుధ', Kannada: 'ಬುಧ', Malayalam: 'ബുധൻ' },
  'Thu': { Hindi: 'गुरु', Tamil: 'வியாழன்', Telugu: 'గురు', Kannada: 'ಗುರು', Malayalam: 'വ്യാഴം' },
  'Fri': { Hindi: 'शुक्र', Tamil: 'வெள்ளி', Telugu: 'శుక్ర', Kannada: 'ಶುಕ್ರ', Malayalam: 'വെള്ളി' },
  'Sat': { Hindi: 'शनि', Tamil: 'சனி', Telugu: 'శని', Kannada: 'ಶನಿ', Malayalam: 'ശനി' },
  'Sun': { Hindi: 'रवि', Tamil: 'ஞாயிறு', Telugu: 'ఆది', Kannada: 'ಭಾನು', Malayalam: 'ഞായർ' },
};

const tr = (str, lang) => {
  if (lang === "English" || !lang) return str;
  if (DATA_DICT[str]?.[lang]) return DATA_DICT[str][lang];
  return TR_DICT[str]?.[lang] || str;
};

// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
const wasteTypes = [
  { id:"paddy",     label:"Paddy Straw",       icon:"🌾", price:2200, co2:1.7, industries:["Bioenergy","Fertilizer","Packaging","Paper"] },
  { id:"sugarcane", label:"Sugarcane Bagasse", icon:"🎋", price:1800, co2:1.2, industries:["Paper","Bioenergy","Food Processing","Packaging"] },
  { id:"corn",      label:"Corn Husk",         icon:"🌽", price:2000, co2:1.3, industries:["Textile","Fertilizer","Packaging","Bioenergy"] },
  { id:"cotton",    label:"Cotton Stalks",     icon:"🌿", price:1500, co2:1.5, industries:["Textile","Paper","Bioenergy","Activated Carbon"] },
  { id:"coconut",   label:"Coconut Husk",      icon:"🥥", price:3500, co2:0.9, industries:["Activated Carbon","Handicrafts","Bioenergy","Cosmetics"] },
  { id:"rice_bran", label:"Rice Bran",         icon:"🍚", price:2800, co2:1.0, industries:["Oil Extraction","Animal Feed","Cosmetics","Pharma"] },
  { id:"banana",    label:"Banana Stem/Peel",  icon:"🍌", price:1600, co2:0.7, industries:["Textile Fiber","Fertilizer","Paper","Animal Feed"] },
  { id:"groundnut", label:"Groundnut Shells",  icon:"🥜", price:1900, co2:1.1, industries:["Bioenergy","Particle Board","Animal Feed","Fertilizer"] },
];

const mockListings = [
  { id:1, farmer:"Ravi Kumar",   village:"Thanjavur, TN",  waste:"Paddy Straw",       qty:8,  price:2200, icon:"🌾", distance:23, rating:4.7, co2:1.7 },
  { id:2, farmer:"Suresh Patel", village:"Surat, GJ",      waste:"Sugarcane Bagasse", qty:15, price:1800, icon:"🎋", distance:45, rating:4.5, co2:1.2 },
  { id:3, farmer:"Murugan S",    village:"Coimbatore, TN", waste:"Coconut Husk",      qty:5,  price:3500, icon:"🥥", distance:12, rating:4.9, co2:0.9 },
  { id:4, farmer:"Aman Singh",   village:"Ludhiana, PB",   waste:"Cotton Stalks",     qty:20, price:1500, icon:"🌿", distance:67, rating:4.3, co2:1.5 },
  { id:5, farmer:"Priya Devi",   village:"Madurai, TN",    waste:"Banana Stem/Peel",  qty:3,  price:1600, icon:"🍌", distance:31, rating:4.6, co2:0.7 },
  { id:6, farmer:"Karthik R",    village:"Erode, TN",      waste:"Groundnut Shells",  qty:10, price:1900, icon:"🥜", distance:18, rating:4.8, co2:1.1 },
];

const marketData = [
  { crop:"Tomato",       cat:"veg",   market:"Coimbatore", min:800,  max:1400,  modal:1100,  trend:"up" },
  { crop:"Onion",        cat:"veg",   market:"Salem",      min:600,  max:1200,  modal:950,   trend:"down" },
  { crop:"Rice (Raw)",   cat:"grain", market:"Thanjavur",  min:1800, max:2200,  modal:2050,  trend:"up",  best:true },
  { crop:"Maize",        cat:"grain", market:"Erode",      min:1100, max:1400,  modal:1280,  trend:"up" },
  { crop:"Banana",       cat:"fruit", market:"Trichy",     min:700,  max:1100,  modal:900,   trend:"up" },
  { crop:"Mango",        cat:"fruit", market:"Dindigul",   min:2500, max:4500,  modal:3800,  trend:"up",  best:true },
  { crop:"Chilli (Dry)", cat:"spice", market:"Madurai",    min:8000, max:14000, modal:11500, trend:"up" },
  { crop:"Turmeric",     cat:"spice", market:"Erode",      min:6500, max:9000,  modal:7800,  trend:"down",best:true },
];
const cropDB = {
  "Red Loamy Soil": {
    "Kharif (Jun–Oct)": [
      { name:"Groundnut",  icon:"🥜", score:94, duration:"90–110 days", profit:"₹45,000–60,000/acre", note:"Excellent for red loamy soil, high export demand" },
      { name:"Sesame",     icon:"🌿", score:88, duration:"75–90 days",  profit:"₹35,000–50,000/acre", note:"Low water, high oil content, good market price" },
      { name:"Green Gram", icon:"🫘", score:82, duration:"60–70 days",  profit:"₹28,000–40,000/acre", note:"Quick returns, improves soil nitrogen" },
    ],
    "Rabi (Nov–Mar)": [
      { name:"Sunflower", icon:"🌻", score:91, duration:"90–100 days", profit:"₹40,000–55,000/acre", note:"High demand for oil extraction" },
      { name:"Sorghum",   icon:"🌾", score:85, duration:"100–110 days",profit:"₹32,000–45,000/acre", note:"Drought tolerant, good fodder value" },
      { name:"Chilli",    icon:"🌶", score:80, duration:"120–150 days",profit:"₹60,000–90,000/acre", note:"High profit but needs pest management" },
    ],
    "Zaid (Apr–Jun)": [
      { name:"Watermelon",  icon:"🍉", score:89, duration:"70–80 days", profit:"₹50,000–70,000/acre", note:"Summer demand, quick returns" },
      { name:"Cowpea",      icon:"🫛", score:83, duration:"55–65 days", profit:"₹25,000–38,000/acre", note:"Heat tolerant, good market near urban areas" },
      { name:"Bitter Gourd",icon:"🥒", score:78, duration:"55–70 days", profit:"₹35,000–50,000/acre", note:"Medicinal value, consistent urban demand" },
    ],
  },
  "Black Cotton Soil": {
    "Kharif (Jun–Oct)": [
      { name:"Cotton",  icon:"🪡", score:96, duration:"150–180 days",profit:"₹55,000–80,000/acre", note:"Best suited for black soil, high national demand" },
      { name:"Soybean", icon:"🫘", score:87, duration:"90–100 days", profit:"₹38,000–52,000/acre", note:"Good protein crop, improving market prices" },
      { name:"Maize",   icon:"🌽", score:83, duration:"80–95 days",  profit:"₹32,000–48,000/acre", note:"Dual use – food and animal feed" },
    ],
    "Rabi (Nov–Mar)": [
      { name:"Wheat",    icon:"🌾", score:90, duration:"110–130 days",profit:"₹40,000–58,000/acre", note:"Suitable for black soil in cooler months" },
      { name:"Chickpea", icon:"🫘", score:86, duration:"90–110 days", profit:"₹35,000–50,000/acre", note:"Drought tolerant, MSP support available" },
      { name:"Safflower",icon:"🌼", score:79, duration:"130–140 days",profit:"₹30,000–44,000/acre", note:"Oil crop, suitable for black heavy soil" },
    ],
    "Zaid (Apr–Jun)": [
      { name:"Mung Bean",icon:"🫛", score:85, duration:"55–65 days", profit:"₹28,000–42,000/acre", note:"Residual moisture crop, quick returns" },
      { name:"Sesame",   icon:"🌿", score:80, duration:"75–90 days", profit:"₹32,000–48,000/acre", note:"Uses stored moisture in black soil well" },
      { name:"Okra",     icon:"🫑", score:76, duration:"45–60 days", profit:"₹40,000–55,000/acre", note:"High frequency harvest, good for small farms" },
    ],
  },
  "Sandy Loam": {
    "Kharif (Jun–Oct)": [
      { name:"Groundnut", icon:"🥜", score:88, duration:"90–110 days", profit:"₹40,000–55,000/acre", note:"Good drainage suits sandy loam well" },
      { name:"Cowpea",    icon:"🫛", score:83, duration:"55–65 days",  profit:"₹25,000–38,000/acre", note:"Drought tolerant, fixes nitrogen" },
      { name:"Pearl Millet",icon:"🌾",score:79, duration:"75–90 days", profit:"₹28,000–42,000/acre", note:"Thrives in sandy soils, low water need" },
    ],
    "Rabi (Nov–Mar)": [
      { name:"Mustard",  icon:"🌼", score:87, duration:"90–110 days", profit:"₹35,000–50,000/acre", note:"Oil seed crop, good for sandy loam" },
      { name:"Potato",   icon:"🥔", score:84, duration:"70–90 days",  profit:"₹45,000–65,000/acre", note:"Excellent drainage needed — sandy loam ideal" },
      { name:"Garlic",   icon:"🧄", score:80, duration:"130–150 days",profit:"₹60,000–80,000/acre", note:"High value crop, good sandy soil drainage" },
    ],
    "Zaid (Apr–Jun)": [
      { name:"Watermelon",icon:"🍉", score:91, duration:"70–80 days", profit:"₹50,000–70,000/acre", note:"Best in sandy soil, huge summer demand" },
      { name:"Cucumber",  icon:"🥒", score:85, duration:"45–60 days", profit:"₹35,000–50,000/acre", note:"Fast growing, good market returns" },
      { name:"Moong",     icon:"🫛", score:78, duration:"55–65 days", profit:"₹25,000–38,000/acre", note:"Summer short duration crop" },
    ],
  },
  "Alluvial Soil": {
    "Kharif (Jun–Oct)": [
      { name:"Rice",      icon:"🌾", score:97, duration:"120–150 days",profit:"₹50,000–70,000/acre", note:"Alluvial soil is ideal for paddy cultivation" },
      { name:"Jute",      icon:"🧵", score:88, duration:"90–120 days", profit:"₹35,000–50,000/acre", note:"Requires waterlogged conditions, great for alluvial" },
      { name:"Sugarcane", icon:"🎋", score:85, duration:"300–360 days",profit:"₹80,000–1,20,000/acre",note:"Long duration but very high returns" },
    ],
    "Rabi (Nov–Mar)": [
      { name:"Wheat",    icon:"🌾", score:95, duration:"110–130 days",profit:"₹42,000–60,000/acre", note:"Alluvial plains of north India, highest yield" },
      { name:"Mustard",  icon:"🌼", score:88, duration:"90–110 days", profit:"₹35,000–50,000/acre", note:"Oil seed, very profitable in Rabi season" },
      { name:"Potato",   icon:"🥔", score:86, duration:"70–90 days",  profit:"₹50,000–70,000/acre", note:"Alluvial soils of UP/Punjab are ideal" },
    ],
    "Zaid (Apr–Jun)": [
      { name:"Maize",     icon:"🌽", score:87, duration:"80–95 days",  profit:"₹35,000–50,000/acre", note:"Good in river basin alluvial areas" },
      { name:"Mung Bean", icon:"🫛", score:83, duration:"55–65 days",  profit:"₹28,000–42,000/acre", note:"Short duration, uses residual moisture" },
      { name:"Cucumber",  icon:"🥒", score:79, duration:"45–60 days",  profit:"₹35,000–48,000/acre", note:"River belt alluvial soils give great yield" },
    ],
  },
};

const schemes = [
  { icon:"🌱", name:"PM Kisan Samman Nidhi",      benefit:"₹6,000/year Direct Transfer",   desc:"Direct income support to small and marginal farmers in three installments.", link:"https://pmkisan.gov.in" },
  { icon:"🌾", name:"PM Fasal Bima Yojana",       benefit:"Up to ₹2 Lakh Insurance",       desc:"Crop insurance providing financial support for crop loss due to unforeseen events.", link:"https://pmfby.gov.in" },
  { icon:"💧", name:"PM Krishi Sinchayee Yojana", benefit:"55–90% Subsidy on Drip",        desc:"Subsidy on drip and sprinkler irrigation to reduce water usage and increase productivity.", link:"https://pmksy.gov.in" },
  { icon:"🏦", name:"Kisan Credit Card (KCC)",    benefit:"4% Interest Rate Loan",         desc:"Credit facility for agricultural needs including purchase of inputs at lower rates.", link:"https://www.nabard.org" },
  { icon:"🚜", name:"Agricultural Mechanization", benefit:"40–50% Subsidy on Machinery",   desc:"Subsidy for purchase of farm machinery for small and marginal farmers.", link:"https://agrimachinery.nic.in" },
  { icon:"🌿", name:"Paramparagat Krishi Vikas",  benefit:"₹50,000/hectare Support",       desc:"Support for organic farming including certification and marketing support.", link:"https://pgsindia-ncof.gov.in" },
];

const forecast = [
  { day:"Today",icon:"⛅",high:34,low:24,rain:"10%"},
  { day:"Tue",  icon:"☀️",high:36,low:25,rain:"5%"},
  { day:"Wed",  icon:"☀️",high:35,low:24,rain:"5%"},
  { day:"Thu",  icon:"🌧", high:30,low:22,rain:"75%"},
  { day:"Fri",  icon:"🌧", high:28,low:21,rain:"80%"},
  { day:"Sat",  icon:"🌦", high:31,low:22,rain:"40%"},
  { day:"Sun",  icon:"⛅",high:33,low:23,rain:"15%"},
];   // ═══════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════
const Btn = ({ children, onClick, style={}, color=T.green, disabled=false, outline=false }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? "#ccc" : outline ? "transparent" : `linear-gradient(135deg,${color},${color}cc)`,
    color: outline ? color : "#fff",
    border: outline ? `2px solid ${color}` : "none",
    borderRadius:14, padding:"13px 18px",
    cursor: disabled ? "not-allowed" : "pointer", fontSize:14, fontWeight:700,
    width:"100%", fontFamily:"'Segoe UI',sans-serif",
    transition:"all 0.2s", boxShadow: disabled ? "none" : `0 2px 10px ${color}44`,
    ...style
  }}
    onMouseEnter={e=>{ if(!disabled){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=`0 6px 18px ${color}55`; }}}
    onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 2px 10px ${color}44`; }}>
    {children}
  </button>
);

const Card = ({ children, style={} }) => (
  <div style={{ background:"#fff", borderRadius:20, padding:"18px", boxShadow:T.shadow, marginBottom:14, border:"1px solid #e8f5e9", ...style }}>
    {children}
  </div>
);

const Input = ({ label, type="text", placeholder, value, onChange, error, icon }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:12, fontWeight:700, color:T.earth, display:"block", marginBottom:5, letterSpacing:"0.3px" }}>{label}</label>}
    <div style={{ position:"relative" }}>
      {icon && <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>{icon}</span>}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{
          width:"100%", padding: icon ? "11px 12px 11px 38px" : "11px 14px",
          borderRadius:12, border:`1.5px solid ${error ? T.rust : "#d4e8d4"}`,
          fontSize:13, outline:"none", boxSizing:"border-box",
          background: error ? "#fff5f5" : T.cream,
          transition:"border 0.2s", fontFamily:"'Segoe UI',sans-serif"
        }}
        onFocus={e=>{ e.target.style.borderColor=T.green; e.target.style.background="#fff"; }}
        onBlur={e=>{ e.target.style.borderColor=error ? T.rust : "#d4e8d4"; e.target.style.background=T.cream; }}
      />
    </div>
    {error && <div style={{ fontSize:11, color:T.rust, marginTop:4 }}>⚠ {error}</div>}
  </div>
);

const SectionTitle = ({ icon, title, sub }) => (
  <div style={{ marginBottom:18 }}>
    <div style={{ fontSize:20, fontWeight:800, color:T.green, fontFamily:"'Segoe UI',sans-serif" }}>{icon} {title}</div>
    {sub && <div style={{ fontSize:12, color:"#888", marginTop:3 }}>{sub}</div>}
  </div>
);

const Badge = ({ children, color=T.green }) => (
  <span style={{ background:`${color}18`, color, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{children}</span>
);

// ═══════════════════════════════════════════
// SPLASH SCREEN
// ═══════════════════════════════════════════
function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setProgress(p => {
      if (p >= 100) { clearInterval(t); setTimeout(onDone, 300); return 100; }
      return p + 2;
    }), 40);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(160deg,#0a1f0f 0%,#1a3a2a 50%,#2d5a3d 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      fontFamily:"'Segoe UI',sans-serif"
    }}>
      <div style={{ animation:"pulse 1.5s ease-in-out infinite", fontSize:72, marginBottom:16 }}>🌾</div>
      <div style={{ fontSize:32, fontWeight:900, color:"#fff", letterSpacing:"-1px", marginBottom:4 }}>
        AgroSmart <span style={{ color:T.gold }}>+</span>
      </div>
      <div style={{ fontSize:14, color:"#96c9a8", marginBottom:48, letterSpacing:"2px" }}>WASTE2WORTH</div>
      <div style={{ width:200, height:4, background:"rgba(255,255,255,0.15)", borderRadius:4, overflow:"hidden" }}>
        <div style={{ width:`${progress}%`, height:"100%", background:`linear-gradient(90deg,${T.lime},${T.gold})`, borderRadius:4, transition:"width 0.08s linear" }} />
      </div>
      <div style={{ fontSize:11, color:"#96c9a8", marginTop:12 }}>Loading your smart farm companion…</div>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }`}</style>
    </div>
  );
}   // ═══════════════════════════════════════════
// ONBOARDING — LANGUAGE
// ═══════════════════════════════════════════
const translations = {
  English: {
    welcome: "Welcome to AgroSmart",
    subtitle: "Your Smart Farming & Waste2Worth Companion",
    steps: [
      { icon:"🌾", title:"Sell Crop Waste", desc:"Turn your paddy, sugarcane, and cotton waste into profit." },
      { icon:"🌱", title:"Crop Advice", desc:"Get AI-driven crop suggestions based on your soil and district." },
      { icon:"🤖", title:"AI Assistant", desc:"Ask questions about farming, prices, and government schemes in your language." }
    ],
    continue: "Continue →",
    whatYouCanDo: "What you can do:"
  },
  Hindi: {
    welcome: "AgroSmart में आपका स्वागत है",
    subtitle: "आपका स्मार्ट खेती और वेस्ट2वर्थ साथी",
    steps: [
      { icon:"🌾", title:"फसल अपशिष्ट बेचें", desc:"अपने धान, गन्ना और कपास के कचरे को मुनाफे में बदलें।" },
      { icon:"🌱", title:"फसल सलाह", desc:"अपनी मिट्टी और जिले के आधार पर एआई-संचालित फसल सुझाव प्राप्त करें।" },
      { icon:"🤖", title:"एआई सहायक", desc:"अपनी भाषा में खेती, कीमतों और सरकारी योजनाओं के बारे में प्रश्न पूछें।" }
    ],
    continue: "आगे बढ़ें →",
    whatYouCanDo: "आप क्या कर सकते हैं:"
  },
  Tamil: {
    welcome: "AgroSmart க்கு வரவேற்கிறோம்",
    subtitle: "உங்கள் ஸ்மார்ட் விவசாயம் மற்றும் Waste2Worth துணை",
    steps: [
      { icon:"🌾", title:"பயிர் கழிவுகளை விற்கவும்", desc:"உங்கள் நெல், கரும்பு மற்றும் பருத்தி கழிவுகளை லாபமாக மாற்றவும்." },
      { icon:"🌱", title:"பயிர் ஆலோசனை", desc:"உங்கள் மண் மற்றும் மாவட்டத்தின் அடிப்படையில் AI பயிர் ஆலோசனைகளைப் பெறுங்கள்." },
      { icon:"🤖", title:"AI உதவியாளர்", desc:"விவசாயம், விலைகள் மற்றும் அரசு திட்டங்கள் பற்றிய கேள்விகளை உங்கள் மொழியில் கேளுங்கள்." }
    ],
    continue: "தொடரவும் →",
    whatYouCanDo: "நீங்கள் என்ன செய்யலாம்:"
  },
  Telugu: {
    welcome: "AgroSmart కు స్వాగతం",
    subtitle: "మీ స్మార్ట్ ఫార్మింగ్ & వేస్ట్2వర్త్ తోడు",
    steps: [
      { icon:"🌾", title:"పంట వ్యర్థాలను అమ్మండి", desc:"మీ వరి, చెరకు మరియు పత్తి వ్యర్థాలను లాభంగా మార్చండి." },
      { icon:"🌱", title:"పంట సలహా", desc:"మీ నేల మరియు జిల్లా ఆధారంగా AI-ఆధారిత పంట సూచనలను పొందండి." },
      { icon:"🤖", title:"AI అసిస్టెంట్", desc:"మీ భాషలో వ్యవసాయం, ధరలు మరియు ప్రభుత్వ పథకాల గురించి ప్రశ్నలు అడగండి." }
    ],
    continue: "కొనసాగించండి →",
    whatYouCanDo: "మీరు ఏమి చేయవచ్చు:"
  },
  Kannada: {
    welcome: "AgroSmart ಗೆ ಸ್ವಾಗತ",
    subtitle: "ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಮತ್ತು ವೇಸ್ಟ್2ವರ್ತ್ ಒಡನಾಡಿ",
    steps: [
      { icon:"🌾", title:"ಬೆಳೆ ತ್ಯಾಜ್ಯವನ್ನು ಮಾರಿ", desc:"ನಿಮ್ಮ ಭತ್ತ, ಕಬ್ಬು ಮತ್ತು ಹತ್ತಿ ತ್ಯಾಜ್ಯವನ್ನು ಲಾಭವಾಗಿ ಪರಿವರ್ತಿಸಿ." },
      { icon:"🌱", title:"ಬೆಳೆ ಸಲಹೆ", desc:"ನಿಮ್ಮ ಮಣ್ಣು ಮತ್ತು ಜಿಲ್ಲೆಯ ಆಧಾರದ ಮೇಲೆ AI-ಚಾಲಿತ ಬೆಳೆ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ." },
      { icon:"🤖", title:"AI ಸಹಾಯಕ", desc:"ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಕೃಷಿ, ಬೆಲೆಗಳು ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ." }
    ],
    continue: "ಮುಂದುವರಿಸಿ →",
    whatYouCanDo: "ನೀವು ಏನು ಮಾಡಬಹುದು:"
  },
  Malayalam: {
    welcome: "AgroSmart-ലേക്ക് സ്വാഗതം",
    subtitle: "നിങ്ങളുടെ സ്മാർട്ട് ഫാമിംഗ് & വേസ്റ്റ് 2 വർത്ത് കമ്പാനിയൻ",
    steps: [
      { icon:"🌾", title:"വിള മാലിന്യങ്ങൾ വിൽക്കുക", desc:"നിങ്ങളുടെ നെല്ല്, കരിമ്പ്, പരുത്തി മാലിന്യങ്ങൾ ലാഭമാക്കി മാറ്റുക." },
      { icon:"🌱", title:"വിള ഉപദേശം", desc:"നിങ്ങളുടെ മണ്ണും ജില്ലയും അടിസ്ഥാനമാക്കി AI വിള നിർദ്ദേശങ്ങൾ നേടുക." },
      { icon:"🤖", title:"AI അസിസ്റ്റൻ്റ്", desc:"നിങ്ങളുടെ ഭാഷയിൽ കൃഷി, വിലകൾ, സർക്കാർ പദ്ധതികൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക." }
    ],
    continue: "തുടരുക →",
    whatYouCanDo: "നിങ്ങൾക്ക് ചെയ്യാൻ കഴിയുന്നത്:"
  }
};

function LanguageScreen({ onNext }) {
  const [lang, setLang] = useState("English");
  const langs = [
    { code:"English", flag:"🇬🇧", native:"English" },
    { code:"Tamil",   flag:"🇮🇳", native:"தமிழ்" },
    { code:"Hindi",   flag:"🇮🇳", native:"हिन्दी" },
    { code:"Telugu",  flag:"🇮🇳", native:"తెలుగు" },
    { code:"Kannada", flag:"🇮🇳", native:"ಕನ್ನಡ" },
    { code:"Malayalam",flag:"🇮🇳",native:"മലയാളം" },
  ];

  const t = translations[lang] || translations["English"];

  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(160deg,#0a1f0f,#1a3a2a,#2d5a3d)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"32px 20px", fontFamily:"'Segoe UI',sans-serif", color:"#fff"
    }}>
      <div style={{ fontSize:40, marginBottom:8 }}>🌐</div>
      <div style={{ fontSize:22, fontWeight:900, marginBottom:4, textAlign:"center" }}>{t.welcome}</div>
      <div style={{ fontSize:12, color:"#96c9a8", marginBottom:24, textAlign:"center" }}>{t.subtitle}</div>
      
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, width:"100%", maxWidth:340, marginBottom:24 }}>
        {langs.map(l => (
          <button key={l.code} onClick={() => setLang(l.code)} style={{
            background: lang === l.code ? T.gold : "rgba(255,255,255,0.08)",
            border: `2px solid ${lang === l.code ? T.gold : "rgba(255,255,255,0.15)"}`,
            borderRadius:16, padding:"12px", cursor:"pointer", color: lang === l.code ? T.dark : "#fff",
            display:"flex", alignItems:"center", gap:10, transition:"all 0.2s",
            transform: lang === l.code ? "scale(1.03)" : "scale(1)"
          }}>
            <span style={{ fontSize:20 }}>{l.flag}</span>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontWeight:700, fontSize:13 }}>{l.code}</div>
              <div style={{ fontSize:11, opacity:0.8 }}>{l.native}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ width:"100%", maxWidth:340, background:"rgba(255,255,255,0.05)", borderRadius:16, padding:"16px", marginBottom:24 }}>
        <div style={{ fontSize:12, fontWeight:700, color:T.gold, marginBottom:12, textTransform:"uppercase", letterSpacing:"1px" }}>
          {t.whatYouCanDo}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {t.steps.map((step, idx) => (
            <div key={idx} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ fontSize:24 }}>{step.icon}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{step.title}</div>
                <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width:"100%", maxWidth:340 }}>
        <Btn onClick={() => lang && onNext(lang)} disabled={!lang} color={T.gold} style={{ color: T.dark }}>
          {t.continue}
        </Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ONBOARDING — REGISTER / LOGIN
// ═══════════════════════════════════════════
function AuthScreen({ lang, onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [role, setRole] = useState("");
  const [step, setStep] = useState(1); // 1=role, 2=details
  const [form, setForm] = useState({ name:"", phone:"", village:"", company:"", password:"" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter valid 10-digit phone number";
    if (role === "farmer" && !form.village.trim()) e.village = "Village/District is required";
    if (role === "industry" && !form.company.trim()) e.company = "Company name is required";
    if (form.password.length < 4) e.password = "Password must be at least 4 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: form.name, phone: form.phone, role, lang,
        location: role === "farmer" ? form.village : form.company,
        earned: "₹18,500", sold: "12 T", co2: "21 T",
        deals: "8", sourced: "45 T", saved: "₹64K"
      });
    }, 1500);
  };

  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(160deg,#0a1f0f,#1a3a2a,#2d5a3d)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"32px 20px", fontFamily:"'Segoe UI',sans-serif"
    }}>
      <div style={{ fontSize:36, marginBottom:8 }}>🌾</div>
      <div style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:4 }}>AgroSmart</div>
      <div style={{ fontSize:12, color:"#96c9a8", marginBottom:28 }}>Smart Farming · Waste2Worth</div>

      {/* Mode toggle */}
      <div style={{ display:"flex", background:"rgba(255,255,255,0.1)", borderRadius:14, padding:4, marginBottom:24, width:"100%", maxWidth:340 }}>
        {["login","register"].map(m => (
          <button key={m} onClick={() => { setMode(m); setStep(1); setRole(""); setErrors({}); }} style={{
            flex:1, padding:"10px", borderRadius:11, border:"none",
            background: mode === m ? "#fff" : "transparent",
            color: mode === m ? T.green : "#fff", fontWeight:700, fontSize:13,
            cursor:"pointer", transition:"all 0.2s", textTransform:"capitalize"
          }}>{m === "login" ? "🔑 Login" : "📝 Register"}</button>
        ))}
      </div>

      <div style={{ width:"100%", maxWidth:340 }}>

        {/* ROLE SELECTION (register step 1 OR login) */}
        {(mode === "register" ? step === 1 : true) && !role && (
          <Card>
            <div style={{ fontWeight:700, fontSize:15, color:T.green, marginBottom:14, textAlign:"center" }}>
              {mode === "login" ? "Who are you?" : "Step 1: I am a..."}
            </div>
            {[
              { r:"farmer",   icon:"👨‍🌾", label:"Farmer",   sub:"Sell waste • Crop advice • Prices" },
              { r:"industry", icon:"🏭",  label:"Industry", sub:"Buy raw materials • Post demand" }
            ].map(({ r, icon, label, sub }) => (
              <button key={r} onClick={() => setRole(r)} style={{
                width:"100%", background: T.sky, border:`2px solid transparent`,
                borderRadius:16, padding:"16px", cursor:"pointer", marginBottom:10,
                display:"flex", alignItems:"center", gap:14, transition:"all 0.2s",
                textAlign:"left"
              }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.green; e.currentTarget.style.background="#e0f2e8"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.background=T.sky; }}>
                <span style={{ fontSize:36 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight:800, fontSize:15, color:T.dark }}>{label}</div>
                  <div style={{ fontSize:11, color:T.earth, marginTop:2 }}>{sub}</div>
                </div>
              </button>
            ))}
          </Card>
        )}

        {/* DETAILS FORM */}
        {role && (
          <Card>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <button onClick={() => setRole("")} style={{ background:T.sky, border:"none", borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:16 }}>←</button>
              <div style={{ fontWeight:700, fontSize:15, color:T.green }}>
                {mode === "register" ? "Step 2: Your Details" : `Login as ${role === "farmer" ? "👨‍🌾 Farmer" : "🏭 Industry"}`}
              </div>
            </div>

            <Input label="Full Name" placeholder="Enter your name" value={form.name}
              onChange={e => setForm({...form, name:e.target.value})} error={errors.name} icon="👤" />
            <Input label="Phone Number" type="tel" placeholder="10-digit mobile number" value={form.phone}
              onChange={e => setForm({...form, phone:e.target.value})} error={errors.phone} icon="📱" />
            {role === "farmer" && (
              <Input label="Village / District" placeholder="e.g. Thanjavur, Tamil Nadu" value={form.village}
                onChange={e => setForm({...form, village:e.target.value})} error={errors.village} icon="📍" />
            )}
            {role === "industry" && (
              <Input label="Company Name" placeholder="e.g. GreenTech Industries" value={form.company}
                onChange={e => setForm({...form, company:e.target.value})} error={errors.company} icon="🏭" />
            )}
            <Input label="Password" type="password" placeholder="Create a password" value={form.password}
              onChange={e => setForm({...form, password:e.target.value})} error={errors.password} icon="🔒" />

            <div style={{ marginTop:6 }}>
              <Btn onClick={handleSubmit} disabled={loading}>
                {loading ? "⏳ Please wait…" : mode === "login" ? "🔑 Login" : "✅ Create Account"}
              </Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// WASTE TAB
// ═══════════════════════════════════════════
const wasteLocales = {
  English: {
    browseBuy: "🔍 Browse Buyers", postWaste: "➕ Post Waste", myListings: "📋 My Listings",
    browseWaste: "🌾 Browse Waste", myDeals: "🤝 My Deals",
    listingsAvail: "listings available", away: "away", perTonne: "/tonne",
    yourListing: "Your Listing", view: "👁 View", makeOffer: "🤝 Make Offer",
    postTitle: "🌾 Post Your Crop Waste", wasteType: "Waste Type *",
    qty: "Quantity (T) *", price: "Price (₹/T) *", loc: "Location *",
    availFrom: "Available From *", estEarn: "Estimated earning:",
    co2Save: "CO₂ saved:", potBuyers: "Potential buyers:",
    postBtn: "🌾 Post My Listing", postedTitle: "Listing Posted!",
    postedDesc1: "Nearby industries have been notified!", postAnother: "Post Another",
    noListings: "No listings yet", noListingsDesc: "Post your first crop waste listing to start earning!",
    noDeals: "No deals yet", noDealsDesc: "Browse waste listings and send your first offer!",
    dealOfferSent: "Deal Offer Sent!", dealSentDesc: "Expected response in ~2 hours.", done: "Done"
  },
  Hindi: {
    browseBuy: "🔍 खरीदार ब्राउज़ करें", postWaste: "➕ कचरा पोस्ट करें", myListings: "📋 मेरी लिस्टिंग",
    browseWaste: "🌾 कचरा ब्राउज़ करें", myDeals: "🤝 मेरे सौदे",
    listingsAvail: "लिस्टिंग उपलब्ध", away: "दूर", perTonne: "/टन",
    yourListing: "आपकी लिस्टिंग", view: "👁 देखें", makeOffer: "🤝 प्रस्ताव दें",
    postTitle: "🌾 अपना फसल कचरा पोस्ट करें", wasteType: "कचरे का प्रकार *",
    qty: "मात्रा (टन) *", price: "मूल्य (₹/टन) *", loc: "स्थान *",
    availFrom: "कब से उपलब्ध *", estEarn: "अनुमानित कमाई:",
    co2Save: "CO₂ की बचत:", potBuyers: "संभावित खरीदार:",
    postBtn: "🌾 मेरी लिस्टिंग पोस्ट करें", postedTitle: "लिस्टिंग पोस्ट की गई!",
    postedDesc1: "आस-पास के उद्योगों को सूचित कर दिया गया है!", postAnother: "एक और पोस्ट करें",
    noListings: "अभी तक कोई लिस्टिंग नहीं", noListingsDesc: "कमाई शुरू करने के लिए अपना पहला फसल कचरा लिस्टिंग पोस्ट करें!",
    noDeals: "अभी तक कोई सौदे नहीं", noDealsDesc: "कचरा लिस्टिंग ब्राउज़ करें और अपना पहला प्रस्ताव भेजें!",
    dealOfferSent: "सौदा प्रस्ताव भेजा गया!", dealSentDesc: "लगभग 2 घंटे में प्रतिक्रिया की उम्मीद है।", done: "पूर्ण"
  },
  Tamil: {
    browseBuy: "🔍 வாங்குபவர்களை உலாவு", postWaste: "➕ கழிவுகளை பதிவிடு", myListings: "📋 எனது பதிவுகள்",
    browseWaste: "🌾 கழிவுகளை உலாவு", myDeals: "🤝 எனது ஒப்பந்தங்கள்",
    listingsAvail: "பதிவுகள் உள்ளன", away: "தொலைவில்", perTonne: "/டன்",
    yourListing: "உங்கள் பதிவு", view: "👁 காண்க", makeOffer: "🤝 சலுகை வழங்கு",
    postTitle: "🌾 உங்கள் பயிர் கழிவுகளை பதிவிடவும்", wasteType: "கழிவு வகை *",
    qty: "அளவு (டன்) *", price: "விலை (₹/டன்) *", loc: "இடம் *",
    availFrom: "கிடைக்கும் தேதி *", estEarn: "உத்தேச வருமானம்:",
    co2Save: "CO₂ சேமிப்பு:", potBuyers: "சாத்தியமான வாங்குபவர்கள்:",
    postBtn: "🌾 எனது பதிவை சமர்ப்பி", postedTitle: "பதிவு சமர்ப்பிக்கப்பட்டது!",
    postedDesc1: "அருகிலுள்ள தொழில்களுக்கு அறிவிக்கப்பட்டுள்ளது!", postAnother: "இன்னொன்றை பதிவிடு",
    noListings: "பதிவுகள் எதுவும் இல்லை", noListingsDesc: "சம்பாதிக்க உங்கள் முதல் கழிவு பதிவை இடவும்!",
    noDeals: "ஒப்பந்தங்கள் எதுவும் இல்லை", noDealsDesc: "கழிவு பதிவுகளை உலாவி உங்கள் முதல் சலுகையை அனுப்பவும்!",
    dealOfferSent: "ஒப்பந்த சலுகை அனுப்பப்பட்டது!", dealSentDesc: "சுமார் 2 மணிநேரத்தில் பதில் எதிர்பார்க்கப்படுகிறது.", done: "முடிந்தது"
  },
  Telugu: {
    browseBuy: "🔍 కొనుగోలుదారులను బ్రౌజ్ చేయండి", postWaste: "➕ వ్యర్థాలను పోస్ట్ చేయండి", myListings: "📋 నా లిస్టింగ్‌లు",
    browseWaste: "🌾 వ్యర్థాలను బ్రౌజ్ చేయండి", myDeals: "🤝 నా ఒప్పందాలు",
    listingsAvail: "లిస్టింగ్‌లు అందుబాటులో ఉన్నాయి", away: "దూరంలో", perTonne: "/టన్ను",
    yourListing: "మీ లిస్టింగ్", view: "👁 చూడండి", makeOffer: "🤝 ఆఫర్ చేయండి",
    postTitle: "🌾 మీ పంట వ్యర్థాలను పోస్ట్ చేయండి", wasteType: "వ్యర్థాల రకం *",
    qty: "పరిమాణం (టన్నులు) *", price: "ధర (₹/టన్ను) *", loc: "స్థానం *",
    availFrom: "ఎప్పటినుండి అందుబాటులో *", estEarn: "అంచనా ఆదాయం:",
    co2Save: "CO₂ ఆదా:", potBuyers: "సంభావ్య కొనుగోలుదారులు:",
    postBtn: "🌾 నా లిస్టింగ్‌ను పోస్ట్ చేయండి", postedTitle: "లిస్టింగ్ పోస్ట్ చేయబడింది!",
    postedDesc1: "సమీపంలోని పరిశ్రమలకు తెలియజేయబడింది!", postAnother: "మరొకటి పోస్ట్ చేయండి",
    noListings: "ఇంకా లిస్టింగ్‌లు లేవు", noListingsDesc: "సంపాదించడం ప్రారంభించడానికి మీ మొదటి వ్యర్థాల లిస్టింగ్‌ను పోస్ట్ చేయండి!",
    noDeals: "ఇంకా ఒప్పందాలు లేవు", noDealsDesc: "వ్యర్థాల లిస్టింగ్‌లను బ్రౌజ్ చేసి మీ మొదటి ఆఫర్‌ను పంపండి!",
    dealOfferSent: "డీల్ ఆఫర్ పంపబడింది!", dealSentDesc: "సుమారు 2 గంటల్లో ప్రతిస్పందన ఆశించబడుతుంది.", done: "పూర్తయింది"
  },
  Kannada: {
    browseBuy: "🔍 ಖರೀದಿದಾರರನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ", postWaste: "➕ ತ್ಯಾಜ್ಯವನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ", myListings: "📋 ನನ್ನ ಪಟ್ಟಿಗಳು",
    browseWaste: "🌾 ತ್ಯಾಜ್ಯವನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ", myDeals: "🤝 ನನ್ನ ಒಪ್ಪಂದಗಳು",
    listingsAvail: "ಪಟ್ಟಿಗಳು ಲಭ್ಯವಿದೆ", away: "ದೂರದಲ್ಲಿ", perTonne: "/ಟನ್",
    yourListing: "ನಿಮ್ಮ ಪಟ್ಟಿ", view: "👁 ವೀಕ್ಷಿಸಿ", makeOffer: "🤝 ಪ್ರಸ್ತಾಪ ಮಾಡಿ",
    postTitle: "🌾 ನಿಮ್ಮ ಬೆಳೆ ತ್ಯಾಜ್ಯವನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ", wasteType: "ತ್ಯಾಜ್ಯದ ಪ್ರಕಾರ *",
    qty: "ಪ್ರಮಾಣ (ಟನ್) *", price: "ಬೆಲೆ (₹/ಟನ್) *", loc: "ಸ್ಥಳ *",
    availFrom: "ಲಭ್ಯವಿರುವ ದಿನಾಂಕ *", estEarn: "ಅಂದಾಜು ಗಳಿಕೆ:",
    co2Save: "CO₂ ಉಳಿತಾಯ:", potBuyers: "ಸಂಭಾವ್ಯ ಖರೀದಿದಾರರು:",
    postBtn: "🌾 ನನ್ನ ಪಟ್ಟಿಯನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ", postedTitle: "ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ!",
    postedDesc1: "ಹತ್ತಿರದ ಕೈಗಾರಿಕೆಗಳಿಗೆ ತಿಳಿಸಲಾಗಿದೆ!", postAnother: "ಮತ್ತೊಂದು ಪೋಸ್ಟ್ ಮಾಡಿ",
    noListings: "ಯಾವುದೇ ಪಟ್ಟಿಗಳಿಲ್ಲ", noListingsDesc: "ಗಳಿಸಲು ನಿಮ್ಮ ಮೊದಲ ತ್ಯಾಜ್ಯ ಪಟ್ಟಿಯನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ!",
    noDeals: "ಯಾವುದೇ ಒಪ್ಪಂದಗಳಿಲ್ಲ", noDealsDesc: "ತ್ಯಾಜ್ಯ ಪಟ್ಟಿಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಮೊದಲ ಪ್ರಸ್ತಾಪವನ್ನು ಕಳುಹಿಸಿ!",
    dealOfferSent: "ಒಪ್ಪಂದದ ಪ್ರಸ್ತಾಪ ಕಳುಹಿಸಲಾಗಿದೆ!", dealSentDesc: "ಸುಮಾರು 2 ಗಂಟೆಗಳಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ.", done: "ಮುಗಿದಿದೆ"
  },
  Malayalam: {
    browseBuy: "🔍 വാങ്ങുന്നവരെ തിരയുക", postWaste: "➕ മാലിന്യം പോസ്റ്റ് ചെയ്യുക", myListings: "📋 എൻ്റെ ലിസ്റ്റിംഗുകൾ",
    browseWaste: "🌾 മാലിന്യം തിരയുക", myDeals: "🤝 എൻ്റെ ഇടപാടുകൾ",
    listingsAvail: "ലിസ്റ്റിംഗുകൾ ലഭ്യമാണ്", away: "അകലെ", perTonne: "/ടൺ",
    yourListing: "നിങ്ങളുടെ ലിസ്റ്റിംഗ്", view: "👁 കാണുക", makeOffer: "🤝 ഓഫർ നൽകുക",
    postTitle: "🌾 നിങ്ങളുടെ വിള മാലിന്യം പോസ്റ്റ് ചെയ്യുക", wasteType: "മാലിന്യ തരം *",
    qty: "അളവ് (ടൺ) *", price: "വില (₹/ടൺ) *", loc: "സ്ഥലം *",
    availFrom: "ലഭ്യമായ തീയതി *", estEarn: "കണക്കാക്കിയ വരുമാനം:",
    co2Save: "CO₂ ലാഭിച്ചത്:", potBuyers: "സാധ്യതയുള്ള വാങ്ങുന്നവർ:",
    postBtn: "🌾 എൻ്റെ ലിസ്റ്റിംഗ് പോസ്റ്റ് ചെയ്യുക", postedTitle: "ലിസ്റ്റിംഗ് പോസ്റ്റ് ചെയ്തു!",
    postedDesc1: "സമീപമുള്ള വ്യവസായങ്ങളെ അറിയിച്ചിട്ടുണ്ട്!", postAnother: "മറ്റൊന്ന് പോസ്റ്റ് ചെയ്യുക",
    noListings: "ഇതുവരെ ലിസ്റ്റിംഗുകളില്ല", noListingsDesc: "സമ്പാദിക്കാൻ നിങ്ങളുടെ ആദ്യ മാലിന്യ ലിസ്റ്റിംഗ് പോസ്റ്റ് ചെയ്യുക!",
    noDeals: "ഇതുവരെ ഇടപാടുകളില്ല", noDealsDesc: "മാലിന്യ ലിസ്റ്റിംഗുകൾ ബ്രൗസ് ചെയ്ത് നിങ്ങളുടെ ആദ്യ ഓഫർ അയയ്ക്കുക!",
    dealOfferSent: "ഇടപാട് ഓഫർ അയച്ചു!", dealSentDesc: "ഏകദേശം 2 മണിക്കൂറിനുള്ളിൽ പ്രതികരണം പ്രതീക്ഷിക്കുന്നു.", done: "പൂർത്തിയായി"
  }
};

function WasteTab({ role, user, myListings, setMyListings, myDeals, setMyDeals, lang="English" }) {
  const [view, setView] = useState(role === "farmer" ? "browse" : "browse");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [dealSent, setDealSent] = useState(false);
  const [posted, setPosted] = useState(false);
  const [form, setForm] = useState({ type:"", qty:"", price:"", location:"", date:"" });
  const [errors, setErrors] = useState({});
  const resultRef = useRef(null);

  const filters = ["All","Paddy","Sugarcane","Coconut","Cotton","Rice Bran","Banana","Groundnut"];
  const allListings = [...mockListings, ...myListings];
  const filtered = filter === "All" ? allListings : allListings.filter(l => l.waste.toLowerCase().includes(filter.toLowerCase()));
  const chosenWaste = wasteTypes.find(w => w.label === form.type);
  const t = wasteLocales[lang] || wasteLocales["English"];

  const validatePost = () => {
    const e = {};
    if (!form.type) e.type = "Please select a waste type";
    if (!form.qty || +form.qty <= 0) e.qty = "Enter valid quantity";
    if (!form.price || +form.price <= 0) e.price = "Enter valid price";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.date) e.date = "Available date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePost = () => {
    if (!validatePost()) return;
    const newListing = {
      id: Date.now(), farmer: user.name, village: user.location,
      waste: form.type, qty: +form.qty, price: +form.price,
      icon: wasteTypes.find(w=>w.label===form.type)?.icon || "🌾",
      distance: Math.floor(Math.random()*50)+5, rating:4.5,
      co2: chosenWaste?.co2 || 1.0, mine: true
    };
    setMyListings(prev => [...prev, newListing]);
    setPosted(true);
  };

  const handleDeal = () => {
    const deal = {
      id: Date.now(), farmer: selected.farmer, waste: selected.waste,
      qty: selected.qty, price: selected.price, status: "Pending",
      co2: (selected.qty * selected.co2).toFixed(1), icon: selected.icon
    };
    setMyDeals(prev => [...prev, deal]);
    setDealSent(true);
  };

  const farmerViews = ["browse","post","mylistings"];
  const industryViews = ["browse","mydeals"];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      {/* View Switcher */}
      <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
        {(role === "farmer" ? [
          { v:"browse", label: t.browseBuy },
          { v:"post",   label: t.postWaste },
          { v:"mylistings", label: t.myListings }
        ] : [
          { v:"browse",  label: t.browseWaste },
          { v:"mydeals", label: t.myDeals }
        ]).map(({ v, label }) => (
          <button key={v} onClick={() => { setView(v); setPosted(false); }} style={{
            padding:"9px 16px", borderRadius:12, whiteSpace:"nowrap",
            border:`2px solid ${view===v ? T.green : "#ddd"}`,
            background: view===v ? T.green : "#fff",
            color: view===v ? "#fff" : T.earth,
            cursor:"pointer", fontSize:12, fontWeight:700, transition:"all 0.2s"
          }}>{label}{v==="mylistings" && myListings.length>0 && <span style={{ background:T.gold, color:T.dark, borderRadius:20, padding:"0 6px", fontSize:10, marginLeft:6 }}>{myListings.length}</span>}
          {v==="mydeals" && myDeals.length>0 && <span style={{ background:T.gold, color:T.dark, borderRadius:20, padding:"0 6px", fontSize:10, marginLeft:6 }}>{myDeals.length}</span>}
          </button>
        ))}
      </div>

      {/* BROWSE */}
      {view === "browse" && (
        <>
          <div style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:14, paddingBottom:4 }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:"5px 13px", borderRadius:20, whiteSpace:"nowrap",
                border:`1.5px solid ${filter===f ? T.green : "#ddd"}`,
                background: filter===f ? T.green : "#fff",
                color: filter===f ? "#fff" : T.earth,
                cursor:"pointer", fontSize:11, fontWeight:filter===f?700:400
              }}>{f}</button>
            ))}
          </div>
          <div style={{ fontSize:12, color:T.earth, marginBottom:10 }}>
            {filtered.length} {t.listingsAvail}
          </div>
          {filtered.map(l => (
            <div key={l.id} style={{
              background:"#fff", borderRadius:18, padding:"14px 16px", marginBottom:11,
              boxShadow:T.shadow, cursor:"pointer", transition:"all 0.2s",
              border:`1.5px solid ${selected?.id===l.id ? T.green : "#eef5ee"}`
            }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow=T.shadowHover}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=T.shadow}
              onClick={() => { setSelected(l); setDealSent(false); }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ fontSize:28, background:T.sky, borderRadius:12, width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center" }}>{l.icon}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:T.dark }}>{l.waste}</div>
                    <div style={{ fontSize:11, color:T.earth }}>👨‍🌾 {l.farmer} · {l.village}</div>
                    <div style={{ fontSize:11, color:"#aaa" }}>📍 {l.distance} km {t.away}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:900, color:T.green, fontSize:15 }}>₹{l.price.toLocaleString()}</div>
                  <div style={{ fontSize:10, color:T.earth }}>{t.perTonne} · {l.qty} T</div>
                  <div style={{ fontSize:11, color:T.gold, marginTop:2 }}>⭐ {l.rating}</div>
                </div>
              </div>
              {l.mine && <div style={{ marginTop:8 }}><Badge color={T.blue}>{t.yourListing}</Badge></div>}
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:10 }}>
                <button onClick={e=>{ e.stopPropagation(); setSelected(l); setDealSent(false); }} style={{
                  background:T.green, color:"#fff", border:"none", borderRadius:11,
                  padding:"6px 16px", cursor:"pointer", fontSize:12, fontWeight:700
                }}>{role==="farmer" ? t.view : t.makeOffer}</button>
              </div>
            </div>
          ))}
        </>
      )}   {/* POST WASTE */}
      {view === "post" && !posted && (
        <Card>
          <div style={{ fontWeight:700, fontSize:15, color:T.green, marginBottom:14 }}>🌾 Post Your Crop Waste</div>
          <div style={{ fontSize:12, fontWeight:600, color:T.earth, marginBottom:8 }}>Waste Type *</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:4 }}>
            {wasteTypes.map(w => (
              <button key={w.id} onClick={() => { setForm(f=>({...f,type:w.label})); setErrors(e=>({...e,type:""})); }} style={{
                padding:"6px 12px", borderRadius:18,
                border:`1.5px solid ${form.type===w.label ? T.green : "#ddd"}`,
                background: form.type===w.label ? T.sky : "#fff",
                color: form.type===w.label ? T.green : T.earth,
                cursor:"pointer", fontSize:12, fontWeight:form.type===w.label?700:400, transition:"all 0.15s"
              }}>{w.icon} {w.label}</button>
            ))}
          </div>
          {errors.type && <div style={{ fontSize:11, color:T.rust, marginBottom:10 }}>⚠ {errors.type}</div>}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:T.earth, display:"block", marginBottom:5 }}>Quantity (T) *</label>
              <input type="number" min="1" placeholder="e.g. 10" value={form.qty}
                onChange={e=>{ setForm(f=>({...f,qty:e.target.value})); setErrors(er=>({...er,qty:""})); }}
                style={{ width:"100%", padding:"10px 12px", borderRadius:11, border:`1.5px solid ${errors.qty?T.rust:"#ddd"}`, fontSize:13, outline:"none", boxSizing:"border-box", background:T.cream }} />
              {errors.qty && <div style={{ fontSize:10, color:T.rust, marginTop:3 }}>⚠ {errors.qty}</div>}
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:T.earth, display:"block", marginBottom:5 }}>Price (₹/T) *</label>
              <input type="number" min="1" placeholder="e.g. 2000" value={form.price}
                onChange={e=>{ setForm(f=>({...f,price:e.target.value})); setErrors(er=>({...er,price:""})); }}
                style={{ width:"100%", padding:"10px 12px", borderRadius:11, border:`1.5px solid ${errors.price?T.rust:"#ddd"}`, fontSize:13, outline:"none", boxSizing:"border-box", background:T.cream }} />
              {errors.price && <div style={{ fontSize:10, color:T.rust, marginTop:3 }}>⚠ {errors.price}</div>}
            </div>
          </div>

          <div style={{ marginTop:10 }}>
            <label style={{ fontSize:12, fontWeight:600, color:T.earth, display:"block", marginBottom:5 }}>Location *</label>
            <input type="text" placeholder="e.g. Thanjavur, Tamil Nadu" value={form.location}
              onChange={e=>{ setForm(f=>({...f,location:e.target.value})); setErrors(er=>({...er,location:""})); }}
              style={{ width:"100%", padding:"10px 12px", borderRadius:11, border:`1.5px solid ${errors.location?T.rust:"#ddd"}`, fontSize:13, outline:"none", boxSizing:"border-box", background:T.cream }} />
            {errors.location && <div style={{ fontSize:10, color:T.rust, marginTop:3 }}>⚠ {errors.location}</div>}
          </div>

          <div style={{ marginTop:10 }}>
            <label style={{ fontSize:12, fontWeight:600, color:T.earth, display:"block", marginBottom:5 }}>Available From *</label>
            <input type="date" min={today} value={form.date}
              onChange={e=>{ setForm(f=>({...f,date:e.target.value})); setErrors(er=>({...er,date:""})); }}
              style={{ width:"100%", padding:"10px 12px", borderRadius:11, border:`1.5px solid ${errors.date?T.rust:"#ddd"}`, fontSize:13, outline:"none", boxSizing:"border-box", background:T.cream }} />
            {errors.date && <div style={{ fontSize:10, color:T.rust, marginTop:3 }}>⚠ {errors.date}</div>}
          </div>

          {chosenWaste && form.qty && +form.qty > 0 && (
            <div style={{ background:"#e8f5e9", borderRadius:12, padding:"12px 14px", margin:"14px 0", fontSize:12, color:T.green }}>
              💰 Estimated earning: <strong>₹{(+form.qty * chosenWaste.price).toLocaleString()}</strong> &nbsp;|&nbsp;
              🌿 CO₂ saved: <strong>{(+form.qty * chosenWaste.co2).toFixed(1)} T</strong><br/>
              <span style={{ color:T.earth, marginTop:4, display:"block" }}>🏭 Potential buyers: {chosenWaste.industries.join(", ")}</span>
            </div>
          )}
          <div style={{ marginTop:6 }}>
            <Btn onClick={handlePost}>🌾 Post My Listing</Btn>
          </div>
        </Card>
      )}

      {view === "post" && posted && (
        <Card>
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:20, fontWeight:900, color:T.green, marginBottom:8 }}>{t.postedTitle}</div>
            <div style={{ color:T.earth, fontSize:13, marginBottom:16 }}>{t.postedDesc1}</div>
            <div style={{ background:T.sky, borderRadius:12, padding:13, fontSize:12, color:T.green, marginBottom:16, textAlign:"left" }}>
              <div>🌾 <strong>{form.type}</strong></div>
              <div>📦 {form.qty} Tonnes · ₹{form.price}/T</div>
              <div>📍 {form.location}</div>
              <div>📅 {form.date}</div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn onClick={() => setView("mylistings")} color={T.blue} style={{ flex:1, padding:"10px" }}>{t.myListings}</Btn>
              <Btn onClick={() => { setPosted(false); setForm({type:"",qty:"",price:"",location:"",date:""}); setErrors({}); }} outline color={T.green} style={{ flex:1, padding:"10px" }}>{t.postAnother}</Btn>
            </div>
          </div>
        </Card>
      )}

      {/* MY LISTINGS */}
      {view === "mylistings" && (
        <div>
          {myListings.length === 0 ? (
            <Card style={{ textAlign:"center", padding:"32px 20px" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
              <div style={{ fontWeight:700, fontSize:16, color:T.green, marginBottom:8 }}>{t.noListings}</div>
              <div style={{ fontSize:13, color:T.earth, marginBottom:16 }}>{t.noListingsDesc}</div>
              <Btn onClick={() => setView("post")} style={{ width:"auto", padding:"10px 24px" }}>{t.postWaste}</Btn>
            </Card>
          ) : myListings.map(l => (
            <Card key={l.id}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:28 }}>{l.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:T.dark }}>{l.waste}</div>
                    <div style={{ fontSize:11, color:T.earth }}>{l.qty} Tonnes · ₹{l.price}/T</div>
                  </div>
                </div>
                <Badge color={T.lime}>Active</Badge>
              </div>
              <div style={{ fontSize:11, color:T.earth }}>📍 {l.village}</div>
              <div style={{ background:T.sky, borderRadius:10, padding:"9px 12px", marginTop:10, fontSize:12, color:T.green }}>
                💰 ₹{(l.qty*l.price).toLocaleString()} &nbsp;|&nbsp; 🌿 {(l.qty*l.co2).toFixed(1)}T
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MY DEALS (Industry) */}
      {view === "mydeals" && (
        <div>
          {myDeals.length === 0 ? (
            <Card style={{ textAlign:"center", padding:"32px 20px" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🤝</div>
              <div style={{ fontWeight:700, fontSize:16, color:T.green, marginBottom:8 }}>{t.noDeals}</div>
              <div style={{ fontSize:13, color:T.earth, marginBottom:16 }}>{t.noDealsDesc}</div>
              <Btn onClick={() => setView("browse")} style={{ width:"auto", padding:"10px 24px" }}>{t.browseWaste}</Btn>
            </Card>
          ) : myDeals.map(d => (
            <Card key={d.id}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:28 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:T.dark }}>{d.waste}</div>
                    <div style={{ fontSize:11, color:T.earth }}>from {d.farmer}</div>
                  </div>
                </div>
                <Badge color={d.status==="Confirmed"?T.lime:T.gold}>{d.status}</Badge>
              </div>
              <div style={{ display:"flex", gap:10, fontSize:12, color:T.earth }}>
                <span>📦 {d.qty} T</span>
                <span>₹{d.price.toLocaleString()}/T</span>
                <span>🌿 {d.co2}T CO₂ saved</span>
              </div>
              <div style={{ fontWeight:700, fontSize:13, color:T.green, marginTop:8 }}>
                Total: ₹{(d.qty*d.price).toLocaleString()}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* DEAL MODAL */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={() => { setSelected(null); setDealSent(false); }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:"#fff", borderRadius:"22px 22px 0 0", padding:"24px 20px",
            width:"100%", maxWidth:480, maxHeight:"80vh", overflowY:"auto"
          }}>
            <div style={{ width:40, height:4, background:"#ddd", borderRadius:4, margin:"0 auto 16px" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:900, color:T.dark }}>{selected.icon} {selected.waste}</div>
              <button onClick={() => { setSelected(null); setDealSent(false); }} style={{ background:T.fog, border:"none", borderRadius:20, width:32, height:32, cursor:"pointer", fontSize:16 }}>✕</button>
            </div>
            {!dealSent ? (
              <>
                <div style={{ background:T.sky, borderRadius:14, padding:14, marginBottom:14 }}>
                  {[["Farmer",selected.farmer],["Location",selected.village],["Distance",`${selected.distance} km`],["Quantity",`${selected.qty} tonnes`],["Price",`₹${selected.price.toLocaleString()}/T`],["Total Value",`₹${(selected.qty*selected.price).toLocaleString()}`],["Rating",`⭐ ${selected.rating}`]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                      <span style={{ color:T.earth }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#e8f5e9", borderRadius:11, padding:"10px 14px", marginBottom:14, fontSize:12, color:T.green }}>
                  🌿 This deal saves <strong>{(selected.qty*selected.co2).toFixed(1)} tonnes of CO₂</strong> from burning!
                </div>
                {role === "industry" && <Btn onClick={handleDeal}>🤝 Send Deal Offer</Btn>}
                {role === "farmer" && (
                  <div style={{ fontSize:13, color:T.earth, textAlign:"center", padding:"8px 0" }}>
                    This is your listing or another farmer's listing.
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"16px 0" }}>
                <div style={{ fontSize:56, marginBottom:12 }}>✅</div>
                <div style={{ fontSize:20, fontWeight:900, color:T.green, marginBottom:8 }}>Deal Offer Sent!</div>
                <div style={{ color:T.earth, fontSize:13, marginBottom:14 }}>{selected.farmer} has been notified. Expected response in ~2 hours.</div>
                <div style={{ background:T.sky, borderRadius:11, padding:12, fontSize:12, color:T.green, marginBottom:14 }}>
                  🌿 This deal saves <strong>{(selected.qty*selected.co2).toFixed(1)} T CO₂</strong> from burning!
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <Btn onClick={() => { setSelected(null); setDealSent(false); setView("mydeals"); }} color={T.blue} style={{ flex:1, padding:"10px" }}>📋 My Deals</Btn>
                  <Btn onClick={() => { setSelected(null); setDealSent(false); }} outline color={T.green} style={{ flex:1, padding:"10px" }}>Done</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}   // ═══════════════════════════════════════════
// CROP ADVISOR TAB (Fixed)
// ═══════════════════════════════════════════
function CropTab({ lang="English" }) {
  const [district, setDistrict] = useState("");
  const [soil, setSoil]         = useState("");
  const [season, setSeason]     = useState("");
  const [water, setWater]       = useState("");
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const resultRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!district) e.district = "Select a district";
    if (!soil) e.soil = "Select soil type";
    if (!season) e.season = "Select season";
    if (!water) e.water = "Select water source";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getCrops = () => {
    if (!validate()) return;
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      const soilKey = Object.keys(cropDB).find(k => k.toLowerCase().includes(soil.split(" ")[0].toLowerCase())) || "Red Loamy Soil";
      const seasonKey = Object.keys(cropDB[soilKey]).find(k => k.toLowerCase().includes(season.split(" ")[0].toLowerCase())) || Object.keys(cropDB[soilKey])[0];
      let crops = [...cropDB[soilKey][seasonKey]];
      // Water source affects scores
      if (water === "Rain-fed") crops = crops.map(c => ({...c, score: Math.max(c.score-8, 60)}));
      if (water === "Drip Irrigation") crops = crops.map(c => ({...c, score: Math.min(c.score+3, 99)}));
      setResults(crops);
      setLoading(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
    }, 1400);
  };

  const fields = [
    { label: tr("District *", lang), val:district, set:setDistrict, key:"district", opts:["Coimbatore","Salem","Madurai","Thanjavur","Erode","Trichy","Tirunelveli","Ooty","Indore","Surat","Ludhiana","Nagpur","Jalgaon","Amravati"] },
    { label: tr("Soil Type *", lang), val:soil, set:setSoil, key:"soil", opts:["Red Loamy Soil","Black Cotton Soil","Sandy Loam","Alluvial Soil"] },
    { label: tr("Season *", lang), val:season, set:setSeason, key:"season", opts:["Kharif (Jun–Oct)","Rabi (Nov–Mar)","Zaid (Apr–Jun)"] },
    { label: tr("Water Source *", lang), val:water, set:setWater, key:"water", opts:["Irrigation (Canal)","Borewell","Rain-fed","Drip Irrigation"] },
  ];

  return (
    <div>
      <SectionTitle icon="🌱" title={tr("Crop Advisor", lang)} sub={tr("Get personalized crop recommendations for your farm.", lang)} />
      <Card>
        <div style={{ fontWeight:700, fontSize:14, color:T.green, marginBottom:14 }}>{tr("🗺 Your Farm Details", lang)}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {fields.map(({ label, val, set, key, opts }) => (
            <div key={key}>
              <label style={{ fontSize:12, fontWeight:600, color:T.earth, display:"block", marginBottom:5 }}>{label}</label>
              <select value={val} onChange={e => { set(e.target.value); setErrors(er=>({...er,[key]:""})); }} style={{
                width:"100%", padding:"10px 10px", borderRadius:11,
                border:`1.5px solid ${errors[key] ? T.rust : "#ddd"}`,
                fontSize:12, background:T.cream, outline:"none"
              }}>
                <option value="">{tr("Select…", lang)}</option>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
              {errors[key] && <div style={{ fontSize:10, color:T.rust, marginTop:3 }}>⚠ {errors[key]}</div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop:16 }}>
          <Btn onClick={getCrops} disabled={loading}>
            {loading ? tr("🔍 Analyzing your land…", lang) : tr("🔍 Get Crop Recommendations", lang)}
          </Btn>
        </div>
      </Card>

      {results && (
        <div ref={resultRef}>
          <div style={{ fontWeight:800, fontSize:15, color:T.green, marginBottom:12 }}>
            ✅ Top Crops for {soil} in {season}
          </div>
          <div style={{ fontSize:12, color:T.earth, marginBottom:14, background:T.sky, borderRadius:10, padding:"8px 12px" }}>
            💧 Water source <strong>{water}</strong> has been factored into recommendations
          </div>
          {results.map((c, i) => (
            <div key={c.name} style={{
              background: i===0 ? "linear-gradient(135deg,#e8f5e9,#f1f8e9)" : "#fff",
              border:`2px solid ${i===0 ? T.lime : "#e8f5e9"}`,
              borderRadius:18, padding:"16px", marginBottom:12, position:"relative"
            }}>
              {i===0 && <div style={{ position:"absolute", top:-1, right:16, background:T.gold, color:T.dark, borderRadius:"0 0 12px 12px", padding:"3px 12px", fontSize:11, fontWeight:800 }}>{tr("⭐ Best Choice", lang)}</div>}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <span style={{ fontSize:34 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontWeight:800, fontSize:16, color:T.green }}>{c.name}</div>
                    <div style={{ fontSize:12, color:"#666", marginTop:3 }}>⏱ {c.duration}</div>
                  </div>
                </div>
                <div style={{ background:T.green, color:"#fff", borderRadius:20, padding:"4px 12px", fontSize:13, fontWeight:700 }}>
                  {c.score}%
                </div>
              </div>
              <div style={{ background:T.sky, borderRadius:10, padding:"9px 12px", marginTop:12, fontSize:12 }}>
                <div style={{ fontWeight:700, color:T.green, marginBottom:3 }}>{tr("💰 Profit Estimate", lang)}</div>
                <div style={{ color:T.dark }}>{c.profit}</div>
              </div>
              <div style={{ fontSize:12, color:"#666", marginTop:8, lineHeight:1.6 }}>📌 {c.note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// MARKET PRICES
// ═══════════════════════════════════════════
function MarketTab({ lang="English" }) {
  const [filter, setFilter] = useState("all");
  const cats = [
    { id:"all",   label:tr("All", lang) }, { id:"grain", label:tr("🌾 Grain", lang) },
    { id:"veg",   label:tr("🥦 Veggie", lang) }, { id:"fruit", label:tr("🍌 Fruit", lang) },
    { id:"spice", label:tr("🌶 Spice", lang) }
  ];
  const filtered = filter==="all" ? marketData : marketData.filter(m=>m.cat===filter);

  return (
    <div>
      <SectionTitle icon="📊" title={tr("Live Market Prices", lang)} sub={tr("Today's mandi prices — updated 6:00 AM", lang)} />
      <div style={{ display:"flex", gap:7, marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
        {cats.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)} style={{
            padding:"6px 14px", borderRadius:20, whiteSpace:"nowrap",
            border:`1.5px solid ${filter===c.id ? T.green : "#ddd"}`,
            background: filter===c.id ? T.green : "#fff",
            color: filter===c.id ? "#fff" : T.earth,
            cursor:"pointer", fontSize:12, fontWeight:filter===c.id?700:400
          }}>{c.label}</button>
        ))}
      </div>
      {filtered.map((m,i) => (
        <div key={m.crop} style={{
          background:"#fff", borderRadius:16, padding:"13px 16px", marginBottom:9,
          boxShadow:T.shadow, border:`1px solid ${m.best ? T.gold+"55" : "#eef5ee"}`,
          display:"flex", alignItems:"center", justifyContent:"space-between"
        }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:T.dark, display:"flex", alignItems:"center", gap:6 }}>
              {m.crop}
              {m.best && <Badge color={T.gold}>Best</Badge>}
            </div>
            <div style={{ fontSize:11, color:T.earth, marginTop:2 }}>📍 {m.market}</div>
            <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>Min ₹{m.min} · Max ₹{m.max}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:18, fontWeight:900, color: m.trend==="up" ? "#2e7d32" : T.rust }}>
              ₹{m.modal}
            </div>
            <div style={{ fontSize:12, fontWeight:700, color: m.trend==="up" ? "#2e7d32" : T.rust }}>
              {m.trend==="up" ? tr("📈 Rising", lang) : tr("📉 Falling", lang)}
            </div>
          </div>
        </div>
      ))}
      <div style={{ fontSize:11, color:"#aaa", textAlign:"center", marginTop:6 }}>
        📅 Source: Agmarknet · Updated today at 6:00 AM
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// WEATHER TAB
// ═══════════════════════════════════════════
function WeatherTab({ lang="English" }) {
  return (
    <div>
      <SectionTitle icon="🌦" title={tr("Weather & Farm Alerts", lang)} sub={tr("Live forecast and smart farming tips.", lang)} />
      <Card style={{ background:"linear-gradient(135deg,#0f2d1a,#1e4d30)", color:"#fff", border:"none" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:12, color:"#96c9a8" }}>📍 Coimbatore, Tamil Nadu</div>
            <div style={{ fontSize:48, fontWeight:900, color:T.gold, margin:"6px 0" }}>34°C</div>
            <div style={{ fontSize:13, color:"#b8dfc8" }}>⛅ Partly Cloudy · Humidity 72%</div>
            <div style={{ fontSize:11, color:"#7ab897", marginTop:4 }}>💨 14 km/h · 🌅 6:02 AM · 🌇 6:38 PM</div>
          </div>
          <div style={{ fontSize:80, opacity:0.15 }}>⛅</div>
        </div>
      </Card>
      <Card>
        <div style={{ fontWeight:700, fontSize:13, color:T.green, marginBottom:12 }}>📅 7-Day Forecast</div>
        <div style={{ display:"flex", gap:8, overflowX:"auto" }}>
          {forecast.map((d,i) => (
            <div key={d.day} style={{
              flex:"0 0 auto", background: i===0 ? T.green : T.sky,
              borderRadius:14, padding:"12px 10px", textAlign:"center", minWidth:68
            }}>
              <div style={{ fontSize:11, fontWeight:700, color: i===0?"#96c9a8":T.earth, marginBottom:4 }}>{tr(d.day, lang)}</div>
              <div style={{ fontSize:24 }}>{d.icon}</div>
              <div style={{ fontSize:14, fontWeight:800, color: i===0?"#fff":T.dark, marginTop:4 }}>{d.high}°</div>
              <div style={{ fontSize:11, color: i===0?"#96c9a8":"#aaa" }}>{d.low}°</div>
              <div style={{ fontSize:10, color: parseInt(d.rain)>50 ? T.blue : i===0?"#96c9a8":"#bbb", marginTop:2 }}>🌧 {d.rain}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{ background:"#fff8e1", border:"1.5px solid #ffe082" }}>
        <div style={{ fontWeight:700, fontSize:13, color:"#e65100", marginBottom:10 }}>⚠️ Farm Alerts</div>
        {[
          { t:"Heavy Rain Expected — Thu & Fri", m:"Stop pesticide spraying. Check drainage to prevent waterlogging.", c:"#e65100" },
          { t:"Pest Alert — Aphids (Next 5 Days)", m:"High humidity favors aphid outbreak. Check plants each morning.", c:"#6a1b9a" },
        ].map((a,i) => (
          <div key={i} style={{ marginBottom: i===0?12:0, paddingBottom: i===0?12:0, borderBottom: i===0?"1px solid #ffe082":"none" }}>
            <div style={{ fontWeight:700, fontSize:12, color:a.c }}>{a.t}</div>
            <div style={{ fontSize:12, color:"#555", marginTop:3, lineHeight:1.5 }}>{a.m}</div>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{ fontWeight:700, fontSize:13, color:T.green, marginBottom:12 }}>🌱 Smart Farm Tips</div>
        {[
          { icon:"💧", title:"Irrigation", tip:"Soil moisture adequate. Skip watering today. Resume in 3 days." },
          { icon:"🌾", title:"Harvest Window", tip:"Wed–Thu forecast is clear. Ideal window for harvesting and drying." },
          { icon:"🌡️", title:"Temperature", tip:"Night temps drop to 22°C this week. Cover sensitive seedlings." },
        ].map((tip,i) => (
          <div key={i} style={{ display:"flex", gap:12, marginBottom: i<2?10:0, padding:"11px 13px", background:T.sky, borderRadius:12 }}>
            <span style={{ fontSize:20 }}>{tip.icon}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:12, color:T.green, marginBottom:2 }}>{tip.title}</div>
              <div style={{ fontSize:12, color:T.dark, lineHeight:1.5 }}>{tip.tip}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}   
// SCHEMES TAB
// ═══════════════════════════════════════════
function SchemesTab({ lang="English" }) {
  return (
    <div>
      <SectionTitle icon="📋" title={tr("Govt Schemes (DBT)", lang)} sub={tr("Find and apply for grants & subsidies.", lang)} />
      {schemes.map(s => (
        <Card key={s.name}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
            <div style={{ fontSize:28, background:T.sky, borderRadius:14, width:52, height:52, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{s.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:13, color:T.dark }}>{tr(s.name, lang)}</div>
              <div style={{ fontSize:11, color:T.earth, lineHeight:1.5, marginTop:3 }}>{tr(s.desc, lang)}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
                <Badge color={T.green}>🎁 {tr(s.benefit, lang)}</Badge>
                <button onClick={() => window.open(s.link,"_blank")} style={{
                  background:T.green, color:"#fff", border:"none", borderRadius:11,
                  padding:"6px 14px", cursor:"pointer", fontSize:12, fontWeight:700
                }}>Apply →</button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// CALCULATOR TAB
// ═══════════════════════════════════════════
function CalcTab({ lang="English" }) {
  const [waste, setWaste] = useState("");
  const [qty, setQty]     = useState("");
  const chosen = wasteTypes.find(w => w.label === waste);
  const co2    = chosen && qty && +qty > 0 ? (+qty * chosen.co2).toFixed(1) : null;
  const earn   = chosen && qty && +qty > 0 ? (+qty * chosen.price).toLocaleString() : null;
  const trees  = co2 ? Math.round(+co2 * 40) : null;

  return (
    <div>
      <SectionTitle icon="💰" title={tr("Profit Calculator", lang)} sub={tr("Estimate your earnings from selling crop waste.", lang)} />
      <Card>
        <div style={{ fontWeight:700, fontSize:13, color:T.green, marginBottom:12 }}>{tr("Waste Type", lang)}</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
          {wasteTypes.map(w => (
            <button key={w.id} onClick={() => setWaste(w.label)} style={{
              padding:"6px 12px", borderRadius:18,
              border:`1.5px solid ${waste===w.label ? T.green : "#ddd"}`,
              background: waste===w.label ? T.sky : "#fff",
              color: waste===w.label ? T.green : T.earth,
              cursor:"pointer", fontSize:12, fontWeight:waste===w.label?700:400, transition:"all 0.15s"
            }}>{w.icon} {w.label}</button>
          ))}
        </div>
        <label style={{ fontSize:12, fontWeight:600, color:T.earth, display:"block", marginBottom:6 }}>{tr("Quantity (Tonnes)", lang)}</label>
        <input type="number" min="1" placeholder="e.g. 10" value={qty} onChange={e=>setQty(e.target.value)}
          style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:"1.5px solid #ddd", fontSize:13, outline:"none", boxSizing:"border-box", background:T.cream }} />

        {earn && (
          <div style={{ marginTop:18 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {[
                { label:tr("Calculated Earnings", lang), value:`₹${earn}`, color:T.green, bg:"#e8f5e9" },
                { label:"Market Rate", value:`₹${chosen.price.toLocaleString()}/T`, color:T.earth, bg:T.fog },
                { label:"CO₂ Saved", value:`${co2} T`, color:T.blue, bg:"#e3f2fd" },
                { label:"= Trees Planted", value:`🌳 ${trees}`, color:"#1b5e20", bg:"#f1f8e9" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ background:bg, borderRadius:14, padding:"14px", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:T.earth, marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:20, fontWeight:900, color }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ background:T.sky, borderRadius:12, padding:13, fontSize:12, color:T.green, marginBottom:12 }}>
              🏭 {tr("Industries that buy", lang)} <strong>{tr(waste, lang)}</strong>:<br/>
              <span style={{ color:T.earth }}>{chosen.industries.map(i => tr(i, lang)).join(" · ")}</span>
            </div>
            <div style={{ background:"linear-gradient(135deg,#0f2d1a,#1e4d30)", borderRadius:13, padding:14, fontSize:12, color:"#b8dfc8", textAlign:"center" }}>
              🌍 By selling instead of burning, you prevent<br/>
              <strong style={{ color:T.gold, fontSize:16 }}>{co2} T CO₂</strong> — same as planting <strong style={{ color:T.lime }}>{trees} trees!</strong>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════
// AI CHAT TAB (Fixed — persists across tabs)
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// APP LOCALES
// ═══════════════════════════════════════════
const appLocales = {
  English: {
    welcome: "Welcome back,",
    earned: "Earned", wasteSold: "Waste Sold", co2Saved: "CO₂ Saved",
    activeDeals: "Active Deals", sourced: "Sourced", saved: "Saved",
    logout: "↩ Logout",
    farmerRole: "👨‍🌾", industryRole: "🏭",
    tabWaste: "Waste", tabCrops: "Crops", tabPrices: "Prices",
    tabWeather: "Weather", tabSchemes: "Schemes", tabCalc: "Calc",
    tabChat: "AI Help", tabBrowse: "Browse", tabDemand: "Demand",
    aiTabTitle: "AI Assistant",
    aiTabSub: "Ask anything about farming, waste, prices or schemes!",
    chatPlaceholder: "Ask about crops, waste, prices, schemes…",
    botThinking: "Thinking…",
    botWelcome: "👋 Hi! I'm your AgroSmart AI Assistant. Ask me anything about selling crop waste, crop recommendations, market prices, government schemes, or farming tips!",
    botError1: "Sorry, I couldn't get a response. Please try again!",
    botError2: "Connection issue. Please check your internet and try again!",
    qFarmer1: "Best crop for black soil?", qFarmer2: "What is paddy straw worth?",
    qFarmer3: "Which govt scheme gives most?", qFarmer4: "Should I irrigate today?",
    qInd1: "Which waste is cheapest now?", qInd2: "Find paddy straw suppliers",
    qInd3: "Benefits of buying agri waste", qInd4: "How to post demand?"
  },
  Hindi: {
    welcome: "वापसी पर स्वागत है,",
    earned: "कमाई", wasteSold: "कचरा बेचा गया", co2Saved: "CO₂ बचाया गया",
    activeDeals: "सक्रिय सौदे", sourced: "प्राप्त किया", saved: "बचत हुई",
    logout: "↩ लॉग आउट",
    farmerRole: "👨‍🌾", industryRole: "🏭",
    tabWaste: "कचरा", tabCrops: "फसलें", tabPrices: "कीमतें",
    tabWeather: "मौसम", tabSchemes: "योजनाएं", tabCalc: "कैलकुलेटर",
    tabChat: "एआई मदद", tabBrowse: "ब्राउज़ करें", tabDemand: "मांग",
    aiTabTitle: "एआई सहायक",
    aiTabSub: "खेती, कचरे, कीमतों या योजनाओं के बारे में कुछ भी पूछें!",
    chatPlaceholder: "फसलों, कचरे, कीमतों, योजनाओं के बारे में पूछें...",
    botThinking: "सोच रहा हूँ...",
    botWelcome: "👋 नमस्ते! मैं आपका AgroSmart एआई सहायक हूँ। मुझसे फसल अपशिष्ट बेचने, फसल की सिफारिशों, बाजार मूल्य, सरकारी योजनाओं या खेती के सुझावों के बारे में कुछ भी पूछें!",
    botError1: "क्षमा करें, मुझे कोई उत्तर नहीं मिला। कृपया पुनः प्रयास करें!",
    botError2: "कनेक्शन समस्या। कृपया अपना इंटरनेट जांचें और पुनः प्रयास करें!",
    qFarmer1: "काली मिट्टी के लिए सबसे अच्छी फसल?", qFarmer2: "धान के भूसे की कीमत क्या है?",
    qFarmer3: "कौन सी सरकारी योजना सबसे ज्यादा देती है?", qFarmer4: "क्या मुझे आज सिंचाई करनी चाहिए?",
    qInd1: "अभी कौन सा कचरा सबसे सस्ता है?", qInd2: "धान के भूसे के आपूर्तिकर्ता खोजें",
    qInd3: "कृषि अपशिष्ट खरीदने के लाभ", qInd4: "मांग कैसे पोस्ट करें?"
  },
  Tamil: {
    welcome: "மீண்டும் வருக,",
    earned: "சம்பாதித்தது", wasteSold: "கழிவு விற்கப்பட்டது", co2Saved: "CO₂ சேமிக்கப்பட்டது",
    activeDeals: "செயலில் உள்ள ஒப்பந்தங்கள்", sourced: "பெறப்பட்டது", saved: "சேமிக்கப்பட்டது",
    logout: "↩ வெளியேறு",
    farmerRole: "👨‍🌾", industryRole: "🏭",
    tabWaste: "கழிவு", tabCrops: "பயிர்கள்", tabPrices: "விலைகள்",
    tabWeather: "வானிலை", tabSchemes: "திட்டங்கள்", tabCalc: "கால்குலேட்டர்",
    tabChat: "AI உதவி", tabBrowse: "உலாவு", tabDemand: "தேவை",
    aiTabTitle: "AI உதவியாளர்",
    aiTabSub: "விவசாயம், கழிவுகள், விலைகள் அல்லது திட்டங்கள் பற்றி எதையும் கேளுங்கள்!",
    chatPlaceholder: "பயிர்கள், கழிவுகள், விலைகள், திட்டங்கள் பற்றி கேளுங்கள்...",
    botThinking: "யோசிக்கிறது...",
    botWelcome: "👋 வணக்கம்! நான் உங்கள் AgroSmart AI உதவியாளர். பயிர் கழிவுகளை விற்பது, பயிர் பரிந்துரைகள், சந்தை விலைகள், அரசு திட்டங்கள் அல்லது விவசாய குறிப்புகள் பற்றி எதையும் என்னிடம் கேளுங்கள்!",
    botError1: "மன்னிக்கவும், எனக்கு பதில் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்!",
    botError2: "இணைப்பு சிக்கல். உங்கள் இணையத்தை சரிபார்த்து மீண்டும் முயற்சிக்கவும்!",
    qFarmer1: "கரிசல் மண்ணுக்கு சிறந்த பயிர்?", qFarmer2: "நெல் வைக்கோலின் மதிப்பு என்ன?",
    qFarmer3: "எந்த அரசு திட்டம் அதிகம் கொடுக்கிறது?", qFarmer4: "நான் இன்று நீர் பாய்ச்ச வேண்டுமா?",
    qInd1: "இப்போது எந்த கழிவு மலிவானது?", qInd2: "நெல் வைக்கோல் வழங்குபவர்களைக் கண்டறியவும்",
    qInd3: "விவசாய கழிவுகளை வாங்குவதன் நன்மைகள்", qInd4: "தேவையை எவ்வாறு பதிவிடுவது?"
  },
  Telugu: {
    welcome: "తిరిగి స్వాగతం,",
    earned: "సంపాదించినది", wasteSold: "వ్యర్థాలు అమ్మబడ్డాయి", co2Saved: "CO₂ ఆదా చేయబడింది",
    activeDeals: "క్రియాశీల ఒప్పందాలు", sourced: "సేకరించబడినది", saved: "ఆదా చేయబడినది",
    logout: "↩ లాగ్ అవుట్",
    farmerRole: "👨‍🌾", industryRole: "🏭",
    tabWaste: "వ్యర్థాలు", tabCrops: "పంటలు", tabPrices: "ధరలు",
    tabWeather: "వాతావరణం", tabSchemes: "పథకాలు", tabCalc: "క్యాలిక్యులేటర్",
    tabChat: "AI సహాయం", tabBrowse: "బ్రౌజ్", tabDemand: "డిమాండ్",
    aiTabTitle: "AI అసిస్టెంట్",
    aiTabSub: "వ్యవసాయం, వ్యర్థాలు, ధరలు లేదా పథకాల గురించి ఏదైనా అడగండి!",
    chatPlaceholder: "పంటలు, వ్యర్థాలు, ధరలు, పథకాల గురించి అడగండి...",
    botThinking: "ఆలోచిస్తోంది...",
    botWelcome: "👋 నమస్తే! నేను మీ AgroSmart AI అసిస్టెంట్‌ని. పంట వ్యర్థాలను అమ్మడం, పంట సూచనలు, మార్కెట్ ధరలు, ప్రభుత్వ పథకాలు లేదా వ్యవసాయ చిట్కాల గురించి నన్ను ఏదైనా అడగండి!",
    botError1: "క్షమించండి, నాకు సమాధానం రాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి!",
    botError2: "కనెక్షన్ సమస్య. దయచేసి మీ ఇంటర్నెట్ తనిఖీ చేసి, మళ్ళీ ప్రయత్నించండి!",
    qFarmer1: "నల్ల రేగడి నేలకు ఉత్తమ పంట?", qFarmer2: "వరి గడ్డి ధర ఎంత?",
    qFarmer3: "ఏ ప్రభుత్వ పథకం ఎక్కువ ఇస్తుంది?", qFarmer4: "నేను ఈ రోజు నీరు పారించాలా?",
    qInd1: "ఇప్పుడు ఏ వ్యర్థాలు చౌకగా ఉన్నాయి?", qInd2: "వరి గడ్డి సరఫరాదారులను కనుగొనండి",
    qInd3: "వ్యవసాయ వ్యర్థాలను కొనుగోలు చేయడం వల్ల లాభాలు", qInd4: "డిమాండ్‌ను ఎలా పోస్ట్ చేయాలి?"
  },
  Kannada: {
    welcome: "ಮರಳಿ ಸ್ವಾಗತ,",
    earned: "ಗಳಿಸಿದ", wasteSold: "ತ್ಯಾಜ್ಯ ಮಾರಾಟ", co2Saved: "CO₂ ಉಳಿಸಲಾಗಿದೆ",
    activeDeals: "ಸಕ್ರಿಯ ಒಪ್ಪಂದಗಳು", sourced: "ಪಡೆದದ್ದು", saved: "ಉಳಿಸಿದ",
    logout: "↩ ಲಾಗ್ ಔಟ್",
    farmerRole: "👨‍🌾", industryRole: "🏭",
    tabWaste: "ತ್ಯಾಜ್ಯ", tabCrops: "ಬೆಳೆಗಳು", tabPrices: "ಬೆಲೆಗಳು",
    tabWeather: "ಹವಾಮಾನ", tabSchemes: "ಯೋಜನೆಗಳು", tabCalc: "ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    tabChat: "AI ಸಹಾಯ", tabBrowse: "ಬ್ರೌಸ್", tabDemand: "ಬೇಡಿಕೆ",
    aiTabTitle: "AI ಸಹಾಯಕ",
    aiTabSub: "ಕೃಷಿ, ತ್ಯಾಜ್ಯ, ಬೆಲೆಗಳು ಅಥವಾ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ!",
    chatPlaceholder: "ಬೆಳೆಗಳು, ತ್ಯಾಜ್ಯ, ಬೆಲೆಗಳು, ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ...",
    botThinking: "ಯೋಚಿಸುತ್ತಿದೆ...",
    botWelcome: "👋 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AgroSmart AI ಸಹಾಯಕ. ಬೆಳೆ ತ್ಯಾಜ್ಯ ಮಾರಾಟ, ಬೆಳೆ ಶಿಫಾರಸುಗಳು, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಅಥವಾ ಕೃಷಿ ಸಲಹೆಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಏನಾದರೂ ಕೇಳಿ!",
    botError1: "ಕ್ಷಮಿಸಿ, ನನಗೆ ಪ್ರತಿಕ್ರಿಯೆ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ!",
    botError2: "ಸಂಪರ್ಕ సమస్య. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ!",
    qFarmer1: "ಕಪ್ಪು ಮಣ್ಣಿಗೆ ಉತ್ತಮ ಬೆಳೆ?", qFarmer2: "ಭತ್ತದ ಹುಲ್ಲಿನ ಬೆಲೆ ಎಷ್ಟು?",
    qFarmer3: "ಯಾವ ಸರ್ಕಾರಿ ಯೋಜನೆ ಹೆಚ್ಚು ನೀಡುತ್ತದೆ?", qFarmer4: "ನಾನು ಇಂದು ನೀರು ಹಾಯಿಸಬೇಕೇ?",
    qInd1: "ಈಗ ಯಾವ ತ್ಯಾಜ್ಯ ಅಗ್ಗವಾಗಿದೆ?", qInd2: "ಭತ್ತದ ಹುಲ್ಲಿನ ಪೂರೈಕೆದಾರರನ್ನು ಹುಡುಕಿ",
    qInd3: "ಕೃಷಿ ತ್ಯಾಜ್ಯವನ್ನು ಖರೀದಿಸುವ ಪ್ರಯೋಜನಗಳು", qInd4: "ಬೇಡಿಕೆಯನ್ನು ಪೋಸ್ಟ್ ಮಾಡುವುದು ಹೇಗೆ?"
  },
  Malayalam: {
    welcome: "തിരികെ സ്വാഗതം,",
    earned: "സമ്പാദിച്ചത്", wasteSold: "മാലിന്യം വിറ്റു", co2Saved: "CO₂ സംരക്ഷിച്ചു",
    activeDeals: "സജീവ ഇടപാടുകൾ", sourced: "ശേഖരിച്ചത്", saved: "ലാഭിച്ചത്",
    logout: "↩ ലോഗ് ഔട്ട്",
    farmerRole: "👨‍🌾", industryRole: "🏭",
    tabWaste: "മാലിന്യം", tabCrops: "വിളകൾ", tabPrices: "വിലകൾ",
    tabWeather: "കാലാവസ്ഥ", tabSchemes: "പദ്ധതികൾ", tabCalc: "കാൽക്കുലേറ്റർ",
    tabChat: "AI സഹായം", tabBrowse: "ബ്രൗസ്", tabDemand: "ആവശ്യം",
    aiTabTitle: "AI അസിസ്റ്റൻ്റ്",
    aiTabSub: "കൃഷി, മാലിന്യങ്ങൾ, വിലകൾ അല്ലെങ്കിൽ പദ്ധതികൾ എന്നിവയെക്കുറിച്ച് എന്തെങ്കിലും ചോദിക്കുക!",
    chatPlaceholder: "വിളകൾ, മാലിന്യങ്ങൾ, വിലകൾ, പദ്ധതികൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...",
    botThinking: "ചിന്തിക്കുന്നു...",
    botWelcome: "👋 നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AgroSmart AI അസിസ്റ്റൻ്റാണ്. വിള മാലിന്യങ്ങൾ വിൽക്കുന്നത്, വിള നിർദ്ദേശങ്ങൾ, വിപണി വിലകൾ, സർക്കാർ പദ്ധതികൾ, അല്ലെങ്കിൽ കൃഷി നുറുങ്ങുകൾ എന്നിവയെക്കുറിച്ച് എന്നോട് എന്തെങ്കിലും ചോദിക്കുക!",
    botError1: "ക്ഷമിക്കണം, എനിക്ക് ഒരു പ്രതികരണം ലഭിച്ചില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക!",
    botError2: "കണക്ഷൻ പ്രശ്നം. നിങ്ങളുടെ ഇൻ്റർനെറ്റ് പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക!",
    qFarmer1: "കരിമണ്ണിന് ഏറ്റവും മികച്ച വിള?", qFarmer2: "നെല്ലിൻ്റെ വൈക്കോലിൻ്റെ വിലയെത്ര?",
    qFarmer3: "ഏത് സർക്കാർ പദ്ധതിയാണ് ഏറ്റവും കൂടുതൽ നൽകുന്നത്?", qFarmer4: "ഞാൻ ഇന്ന് നനയ്ക്കണമോ?",
    qInd1: "ഇപ്പോൾ ഏത് മാലിന്യത്തിനാണ് വിലക്കുറവ്?", qInd2: "നെല്ലിൻ്റെ വൈക്കോൽ വിതരണക്കാരെ കണ്ടെത്തുക",
    qInd3: "കാർഷിക മാലിന്യങ്ങൾ വാങ്ങുന്നതിൻ്റെ ഗുണങ്ങൾ", qInd4: "ആവശ്യം എങ്ങനെ പോസ്റ്റ് ചെയ്യാം?"
  }
};

// ═══════════════════════════════════════════
// AI CHAT TAB (Fixed — persists across tabs)
// ═══════════════════════════════════════════
function ChatTab({ role, user, chatHistory, setChatHistory, lang="English" }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [micListening, setMicListening] = useState(false);
  const endRef = useRef(null);

  const t = appLocales[lang] || appLocales["English"];

  const quickQs = role === "farmer"
    ? [t.qFarmer1, t.qFarmer2, t.qFarmer3, t.qFarmer4]
    : [t.qInd1, t.qInd2, t.qInd3, t.qInd4];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [chatHistory, loading]);

  const startMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice recognition not supported in this browser.");
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setMicListening(true);
    recognition.onerror = (e) => {
      setMicListening(false);
      if (e.error === 'not-allowed') {
        alert("Microphone access blocked. Please click the Lock icon in the URL bar and select 'Allow' for Microphone.");
      } else {
        alert(`Microphone Error (${e.error}). Make sure your Windows Settings -> Privacy -> Speech -> 'Online speech recognition' is turned ON.`);
      }
    };
    recognition.onresult = (e) => {
      setInput(prev => (prev + " " + e.results[0][0].transcript).trim());
    };
    recognition.onend = () => setMicListening(false);
    recognition.start();
  };

  const send = async (msg) => {
    const q = msg || input;
    if (!q.trim() || loading) return;
    const newHistory = [...chatHistory, { from:"user", text:q }];
    setChatHistory(newHistory);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{
            role:"user",
            content:`You are AgroSmart AI — a helpful assistant for an Indian agriculture + waste marketplace platform. 
The user is ${role === "farmer" ? `a farmer named ${user.name} from ${user.location}` : `an industry buyer from ${user.location}`}. 
The user prefers the ${lang} language. IMPORTANT: YOUR ENTIRE RESPONSE MUST BE IN THE ${lang} LANGUAGE!
Help with: crop waste buying/selling, crop recommendations, market prices in ₹, weather tips, government schemes. 
Be warm, practical, and concise (2–4 sentences max). Use ₹ for currency. User question: ${q}`
          }]
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || t.botError1;
      setChatHistory([...newHistory, { from:"bot", text:reply }]);
    } catch {
      setChatHistory([...newHistory, { from:"bot", text:t.botError2 }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <SectionTitle icon="🤖" title={t.aiTabTitle} sub={t.aiTabSub} />
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px", minHeight:300, maxHeight:360, overflowY:"auto", display:"flex", flexDirection:"column", gap:9 }}>
          {chatHistory.map((m,i) => (
            <div key={i} style={{ display:"flex", justifyContent: m.from==="user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth:"82%", padding:"10px 14px",
                borderRadius: m.from==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.from==="user" ? `linear-gradient(135deg,${T.green},#1e4d30)` : T.sky,
                color: m.from==="user" ? "#fff" : T.dark, fontSize:13, lineHeight:1.6
              }}>
                {m.from==="bot" && <span style={{ marginRight:5 }}>🤖</span>}{m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex" }}>
              <div style={{ background:T.sky, borderRadius:"18px 18px 18px 4px", padding:"10px 14px", fontSize:13, color:T.earth }}>
                🤖 <span style={{ opacity:0.7 }}>{t.botThinking}</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Questions — always visible */}
        <div style={{ padding:"8px 12px", borderTop:`1px solid ${T.sky}`, display:"flex", gap:6, flexWrap:"wrap" }}>
          {quickQs.map(q => (
            <button key={q} onClick={() => send(q)} disabled={loading} style={{
              padding:"5px 12px", borderRadius:18,
              border:`1.5px solid ${T.green}`, background:"transparent",
              color:T.green, cursor:loading?"not-allowed":"pointer", fontSize:10, fontWeight:600,
              opacity: loading ? 0.5 : 1
            }}>{q}</button>
          ))}
        </div>

        <div style={{ padding:"10px 13px", borderTop:`1px solid ${T.sky}`, display:"flex", gap:8 }}>
          <button onClick={startMic} disabled={loading} style={{
            background: micListening ? T.rust : "#f0f0f0", color: micListening ? "#fff" : "#555",
            border:"none", borderRadius:13, padding:"0 14px", cursor:"pointer", fontSize:18,
            transition:"all 0.2s", transform: micListening ? "scale(1.1)" : "scale(1)"
          }}>🎙️</button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter" && !loading) send(); }}
            placeholder={micListening ? "Listening..." : t.chatPlaceholder}
            style={{ flex:1, padding:"11px 14px", borderRadius:13, border:`1.5px solid #ddd`, fontSize:13, outline:"none", background:T.cream }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            background: loading || !input.trim() ? "#ccc" : `linear-gradient(135deg,${T.green},#1e4d30)`,
            color:"#fff", border:"none", borderRadius:13, padding:"0 18px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontSize:18,
            transition:"all 0.2s"
          }}>➤</button>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════
// DEMAND TAB (Industry)
// ═══════════════════════════════════════════
function DemandTab({ lang="English" }) {
  const [form, setForm]   = useState({ type:"", qty:"", budget:"", location:"", by:"" });
  const [posted, setPosted] = useState(false);
  const [errors, setErrors] = useState({});
  const today = new Date().toISOString().split("T")[0];

  const validate = () => {
    const e = {};
    if (!form.type) e.type = "Select a waste type";
    if (!form.qty || +form.qty <= 0) e.qty = "Enter valid quantity";
    if (!form.budget || +form.budget <= 0) e.budget = "Enter valid budget";
    if (!form.location.trim()) e.location = "Delivery location is required";
    if (!form.by) e.by = "Required-by date is needed";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div>
      <SectionTitle icon="📢" title={tr("Post Your Demand", lang)} sub={tr("Let farmers know what crop waste you need.", lang)} />
      {!posted ? (
        <Card>
          <div style={{ fontWeight:700, fontSize:14, color:T.green, marginBottom:12 }}>Required Waste Type *</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:4 }}>
            {wasteTypes.map(w => (
              <button key={w.id} onClick={() => { setForm(f=>({...f,type:w.label})); setErrors(e=>({...e,type:""})); }} style={{
                padding:"6px 12px", borderRadius:18,
                border:`1.5px solid ${form.type===w.label ? T.green : "#ddd"}`,
                background: form.type===w.label ? T.sky : "#fff",
                color: form.type===w.label ? T.green : T.earth,
                cursor:"pointer", fontSize:12, fontWeight:form.type===w.label?700:400
              }}>{w.icon} {w.label}</button>
            ))}
          </div>
          {errors.type && <div style={{ fontSize:11, color:T.rust, marginBottom:10 }}>⚠ {errors.type}</div>}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:12 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:T.earth, display:"block", marginBottom:5 }}>Quantity (T) *</label>
              <input type="number" min="1" placeholder="e.g. 50" value={form.qty}
                onChange={e=>{ setForm(f=>({...f,qty:e.target.value})); setErrors(er=>({...er,qty:""})); }}
                style={{ width:"100%", padding:"10px 12px", borderRadius:11, border:`1.5px solid ${errors.qty?T.rust:"#ddd"}`, fontSize:13, outline:"none", boxSizing:"border-box", background:T.cream }} />
              {errors.qty && <div style={{ fontSize:10, color:T.rust, marginTop:3 }}>⚠ {errors.qty}</div>}
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:T.earth, display:"block", marginBottom:5 }}>Budget (₹/T) *</label>
              <input type="number" min="1" placeholder="e.g. 2000" value={form.budget}
                onChange={e=>{ setForm(f=>({...f,budget:e.target.value})); setErrors(er=>({...er,budget:""})); }}
                style={{ width:"100%", padding:"10px 12px", borderRadius:11, border:`1.5px solid ${errors.budget?T.rust:"#ddd"}`, fontSize:13, outline:"none", boxSizing:"border-box", background:T.cream }} />
              {errors.budget && <div style={{ fontSize:10, color:T.rust, marginTop:3 }}>⚠ {errors.budget}</div>}
            </div>
          </div>

          <div style={{ marginTop:10 }}>
            <label style={{ fontSize:12, fontWeight:600, color:T.earth, display:"block", marginBottom:5 }}>Delivery Location *</label>
            <input type="text" placeholder="e.g. Chennai, Tamil Nadu" value={form.location}
              onChange={e=>{ setForm(f=>({...f,location:e.target.value})); setErrors(er=>({...er,location:""})); }}
              style={{ width:"100%", padding:"10px 12px", borderRadius:11, border:`1.5px solid ${errors.location?T.rust:"#ddd"}`, fontSize:13, outline:"none", boxSizing:"border-box", background:T.cream }} />
            {errors.location && <div style={{ fontSize:10, color:T.rust, marginTop:3 }}>⚠ {errors.location}</div>}
          </div>

          <div style={{ marginTop:10 }}>
            <label style={{ fontSize:12, fontWeight:600, color:T.earth, display:"block", marginBottom:5 }}>Required By *</label>
            <input type="date" min={today} value={form.by}
              onChange={e=>{ setForm(f=>({...f,by:e.target.value})); setErrors(er=>({...er,by:""})); }}
              style={{ width:"100%", padding:"10px 12px", borderRadius:11, border:`1.5px solid ${errors.by?T.rust:"#ddd"}`, fontSize:13, outline:"none", boxSizing:"border-box", background:T.cream }} />
            {errors.by && <div style={{ fontSize:10, color:T.rust, marginTop:3 }}>⚠ {errors.by}</div>}
          </div>

          <div style={{ marginTop:14 }}>
            <Btn onClick={() => { if(validate()) setPosted(true); }}>{tr("📢 Post Demand to Farmers", lang)}</Btn>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:20, fontWeight:900, color:T.green, marginBottom:8 }}>{tr("Demand Posted!", lang)}</div>
            <div style={{ color:T.earth, fontSize:13, marginBottom:16 }}>Nearby farmers have been notified about your requirement.</div>
            <div style={{ background:T.sky, borderRadius:12, padding:14, fontSize:12, color:T.green, marginBottom:16, textAlign:"left" }}>
              <div>🌾 <strong>{form.type}</strong></div>
              <div>📦 {form.qty} T needed · Budget ₹{form.budget}/T</div>
              <div>📍 {form.location}</div>
              <div>📅 Required by {form.by}</div>
            </div>
            <Btn onClick={() => { setPosted(false); setForm({type:"",qty:"",budget:"",location:"",by:""}); setErrors({}); }} outline color={T.green} style={{ width:"auto", padding:"10px 28px" }}>Post Another</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}  
//═══════════════════════════════════════════
// NEW FEATURES: SCANNER, LEADERBOARD, VOICE NAV
//═══════════════════════════════════════════
const VoiceNav = ({ setTab, lang="English" }) => {
  const [listening, setListening] = useState(false);
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(tr("Voice recognition not supported in this browser. Please use Chrome or Edge.", lang));
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Defaulting to en-US for max compatibility
    recognition.onstart = () => setListening(true);
    recognition.onerror = (e) => {
      setListening(false);
      if (e.error === 'not-allowed') {
        alert("Microphone access blocked. Please click the Lock icon in the URL bar and select 'Allow' for Microphone.");
      } else {
        alert(`Microphone Error (${e.error}). Make sure your Windows Settings -> Privacy -> Speech -> 'Online speech recognition' is turned ON.`);
      }
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes("waste") || transcript.includes("sell") || transcript.includes("buy")) setTab("waste");
      else if (transcript.includes("crop") || transcript.includes("plant") || transcript.includes("grow") || transcript.includes("advisor")) setTab("crop");
      else if (transcript.includes("price") || transcript.includes("market") || transcript.includes("mandi")) setTab("market");
      else if (transcript.includes("weather") || transcript.includes("rain") || transcript.includes("forecast")) setTab("weather");
      else if (transcript.includes("scheme") || transcript.includes("subsidy") || transcript.includes("government")) setTab("schemes");
      else if (transcript.includes("calculate") || transcript.includes("profit") || transcript.includes("earn") || transcript.includes("value")) setTab("calc");
      else if (transcript.includes("chat") || transcript.includes("ai") || transcript.includes("ask") || transcript.includes("help")) setTab("chat");
      else if (transcript.includes("scan") || transcript.includes("disease") || transcript.includes("leaf") || transcript.includes("photo")) setTab("scanner");
      else if (transcript.includes("leader") || transcript.includes("point") || transcript.includes("carbon") || transcript.includes("rank") || transcript.includes("score")) setTab("leaderboard");
      else if (transcript.includes("demand") || transcript.includes("post")) setTab("demand");
      else alert(tr("Didn't understand", lang) + ": " + transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <button onClick={startListening} style={{
      position:"fixed", bottom:90, right:20, width:60, height:60,
      background:listening ? T.rust : T.gold, color:"#fff", borderRadius:"50%",
      boxShadow: listening ? "0 0 20px rgba(192, 57, 43, 0.8)" : "0 4px 15px rgba(240, 165, 0, 0.4)",
      border:"none", cursor:"pointer",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:28, zIndex:1000, transition:"all 0.3s",
      transform: listening ? "scale(1.15)" : "scale(1)"
    }}>
      🎙️
    </button>
  );
};

function ScannerTab({ lang="English" }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      handleScan(); // auto start scan when photo uploaded
    }
  };

  const handleScan = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      setResult({
        disease: "Aphids (Pest Infestation)",
        confidence: "94%",
        recommendation: "Spray Neem Oil (5ml/L of water) early morning or late evening. Avoid chemical pesticides to protect beneficial insects."
      });
    }, 2500);
  };

  return (
    <div>
      <SectionTitle icon="📸" title={tr("AI Plant Doctor", lang)} sub={tr("Upload or snap a photo of a diseased leaf.", lang)} />
      <Card>
        <div style={{
          height: 250, background: "#000", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden", border: `3px solid ${scanning ? T.lime : "#333"}`,
          boxShadow: scanning ? "0 0 20px rgba(92,184,92,0.4)" : "none", transition:"all 0.3s"
        }}>
          {imageSrc ? (
             <img src={imageSrc} alt="uploaded" style={{ width:"100%", height:"100%", objectFit:"cover", opacity: scanning ? 0.6 : 1 }} />
          ) : (
             <div style={{ color: "#fff", textAlign: "center" }}>
               <div style={{ fontSize: 50, opacity: 0.5 }}>🍃</div>
               <div style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>{tr("Camera Preview", lang)}</div>
             </div>
          )}
          
          {scanning && (
            <div style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
              <div style={{ color: T.lime, fontWeight: 800, textAlign: "center", fontSize:18, textShadow:"0 2px 4px rgba(0,0,0,0.8)", zIndex:2 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔄</div>
                {tr("AI Analyzing Leaf Patterns...", lang)}
              </div>
              <div style={{ position:"absolute", top:0, left:0, width:"100%", height:"10px", background:T.lime, boxShadow:"0 0 20px "+T.lime, animation:"scanAnim 1.5s infinite" }} />
            </div>
          )}
        </div>
        
        <div style={{ marginTop: 16 }}>
          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
          <Btn onClick={() => fileInputRef.current.click()} disabled={scanning}>
            {scanning ? tr("Scanning...", lang) : tr("📸 Upload Photo & Diagnose", lang)}
          </Btn>
        </div>
      </Card>
      
      {result && (
        <Card style={{ borderLeft:`4px solid ${T.rust}`, animation:"slideUp 0.4s ease" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ fontSize:30 }}>🩺</div>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:T.rust }}>{tr("Detected", lang)}: {tr(result.disease, lang)}</div>
              <div style={{ fontSize:12, color:T.earth }}>{tr("AI Confidence", lang)}: {result.confidence}</div>
            </div>
          </div>
          <div style={{ background:T.sky, padding:14, borderRadius:12 }}>
            <div style={{ fontWeight:700, color:T.green, marginBottom:6 }}>{tr("Organic Remedy", lang)}:</div>
            <div style={{ fontSize:13, color:T.dark, lineHeight:1.5 }}>{tr(result.recommendation, lang)}</div>
          </div>
        </Card>
      )}
    </div>
  );
}

function LeaderboardTab({ lang="English" }) {
  const leaders = [
    { name: "Ramesh P.", village: "Thanjavur", co2: 120.5, trees: 4820, badge: "🥇 Eco Champion", progress: "100%" },
    { name: "Karthik R.", village: "Erode", co2: 95.2, trees: 3808, badge: "🥈 Green Guardian", progress: "80%" },
    { name: "Suresh M.", village: "Coimbatore", co2: 80.1, trees: 3204, badge: "🥉 Earth Saver", progress: "66%" },
    { name: "Priya D.", village: "Madurai", co2: 65.4, trees: 2616, badge: "🌿 Planter", progress: "54%" },
  ];

  return (
    <div>
      <SectionTitle icon="🌍" title={tr("Carbon Leaderboard", lang)} sub={tr("Top farmers preventing stubble burning.", lang)} />
      
      <div style={{
        background:"linear-gradient(135deg, #f0a500, #d35400)", borderRadius:16, padding:"20px", marginBottom:20,
        boxShadow:"0 8px 30px rgba(211, 84, 0, 0.3)", color:"#fff", position:"relative", overflow:"hidden"
      }}>
        <div style={{ position:"absolute", top:-20, right:-20, fontSize:100, opacity:0.1 }}>🏆</div>
        <div style={{ textAlign:"center", position:"relative", zIndex:2 }}>
          <div style={{ fontSize:13, fontWeight:600, opacity:0.9, marginBottom:5, textTransform:"uppercase", letterSpacing:1 }}>{tr("Your Impact Rank", lang)}</div>
          <div style={{ fontSize:48, fontWeight:900, textShadow:"0 2px 10px rgba(0,0,0,0.2)" }}>#42</div>
          <div style={{ fontSize:15, marginTop:8, fontWeight:500 }}>{tr("You have saved", lang)} <span style={{fontWeight:800, color:"#fff"}}>12 T CO₂</span> {tr("this year", lang)}!</div>
          <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:20, padding:"6px 16px", display:"inline-block", marginTop:12, fontSize:12, fontWeight:700 }}>
            ⭐️ Top 15% in your region
          </div>
        </div>
      </div>

      <h3 style={{ fontSize:16, color:T.green, marginBottom:12, fontWeight:800 }}>🏆 Regional Top Performers</h3>
      
      {leaders.map((l, i) => (
        <div key={i} style={{ 
          background:"#fff", borderRadius:14, padding:"16px", marginBottom:12,
          boxShadow:"0 4px 15px rgba(0,0,0,0.05)", borderLeft:`5px solid ${i===0?T.gold:i===1?"#bdc3c7":i===2?"#cd7f32":T.lime}`,
          position:"relative"
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ fontSize:24, fontWeight:900, color: i===0 ? T.gold : i===1 ? "#95a5a6" : i===2 ? "#d35400" : T.earth }}>#{i+1}</div>
              <div>
                <div style={{ fontWeight:800, fontSize:15, color:T.dark }}>{tr(l.name, lang)}</div>
                <div style={{ fontSize:12, color:T.earth }}>📍 {tr(l.village, lang)}</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontWeight:900, fontSize:16, color:T.green }}>{l.co2} T <span style={{fontSize:11, color:T.earth}}>CO₂</span></div>
              <div style={{ fontSize:12, fontWeight:700, color:i===0?T.gold:T.rust, marginTop:2 }}>{tr(l.badge, lang)}</div>
            </div>
          </div>
          
          <div style={{ width:"100%", background:T.fog, height:6, borderRadius:3, overflow:"hidden" }}>
             <div style={{ width: l.progress, background: i===0 ? "linear-gradient(90deg, #f1c40f, #f39c12)" : T.lime, height:"100%", borderRadius:3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

//═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [screen, setScreen]   = useState("splash");
  const [lang, setLang]       = useState("English");
  const [user, setUser]       = useState(null);
  const [tab, setTab]         = useState("waste");
  const [anim, setAnim]       = useState(true);
  const [myListings, setMyListings] = useState([]);
  const [myDeals, setMyDeals]       = useState([]);
  
  const initChatMsg = (l) => {
    const t = appLocales[l] || appLocales["English"];
    return { from:"bot", text: t.botWelcome };
  };

  const [chatHistory, setChatHistory] = useState([ initChatMsg("English") ]);

  const go = (s, t) => {
    setAnim(false);
    setTimeout(() => { if(s) setScreen(s); if(t) setTab(t); setAnim(true); }, 160);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setLang(userData.lang);
    setChatHistory([ initChatMsg(userData.lang) ]);
    go("dashboard", "waste");
  };

  const handleLogout = () => {
    setUser(null);
    setMyListings([]);
    setMyDeals([]);
    setChatHistory([ initChatMsg("English") ]);
    go("auth", null);
  };

  // SPLASH
  if (screen === "splash") return <SplashScreen onDone={() => go("language", null)} />;

  // LANGUAGE
  if (screen === "language") return <LanguageScreen onNext={(l) => { setLang(l); go("auth", null); }} />;

  // AUTH
  if (screen === "auth") return <AuthScreen lang={lang} onLogin={handleLogin} />;

  // DASHBOARD
  const t = appLocales[lang] || appLocales["English"];

  const farmerTabs = [
    { id:"waste",   icon:"🌾", label: t.tabWaste || "Waste" },
    { id:"crop",    icon:"🌱", label: t.tabCrops || "Crops" },
    { id:"scanner", icon:"📸", label: tr("Scan", lang) },
    { id:"market",  icon:"📊", label: t.tabPrices || "Prices" },
    { id:"weather", icon:"🌦", label: t.tabWeather || "Weather" },
    { id:"schemes", icon:"📋", label: t.tabSchemes || "Schemes" },
    { id:"calc",    icon:"💰", label: t.tabCalc || "Calc" },
    { id:"leaderboard", icon:"🌍", label: tr("Rank", lang) },
    { id:"chat",    icon:"🤖", label: t.tabChat || "AI Chat" },
  ];
  const industryTabs = [
    { id:"waste",  icon:"🌾", label: t.tabBrowse || "Browse" },
    { id:"demand", icon:"📢", label: t.tabDemand || "Demand" },
    { id:"calc",   icon:"📊", label: t.tabCalc || "Calc" },
    { id:"leaderboard", icon:"🌍", label: tr("Rank", lang) },
    { id:"chat",   icon:"🤖", label: t.tabChat || "AI Chat" },
  ];
  const tabs = user?.role === "farmer" ? farmerTabs : industryTabs;

  return (
    <div style={{ minHeight:"100vh", background:T.cream, fontFamily:"'Segoe UI',sans-serif", color:T.dark, paddingBottom:70 }}>

      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#0a1f0f,#1a3a2a)",
        padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 16px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22 }}>🌾</span>
          <div>
            <div style={{ color:"#fff", fontWeight:900, fontSize:15 }}>
              AgroSmart <span style={{ color:T.gold }}>+</span> Waste2Worth
            </div>
            <div style={{ color:"#7ab897", fontSize:10 }}>
              {user?.role==="farmer" ? t.farmerRole : t.industryRole} {user?.name} · {lang}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
          color:"#fff", padding:"5px 12px", borderRadius:20, cursor:"pointer", fontSize:11, fontWeight:600
        }}>{t.logout}</button>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth:540, margin:"0 auto", padding:"14px 14px 20px",
        opacity:anim?1:0, transform:anim?"translateY(0)":"translateY(8px)",
        transition:"all 0.2s"
      }}>
        {/* Welcome Banner */}
        <div style={{
          background:"linear-gradient(135deg,#0a1f0f,#1a3a2a,#2d5a3d)",
          borderRadius:20, padding:"18px 20px", marginBottom:18,
          color:"#fff", position:"relative", overflow:"hidden"
        }}>
          <div style={{ position:"absolute", right:-10, top:-10, fontSize:90, opacity:0.06 }}>
            {user?.role==="farmer" ? t.farmerRole : t.industryRole}
          </div>
          <div style={{ fontSize:11, color:"#7ab897", marginBottom:2 }}>{t.welcome}</div>
          <div style={{ fontSize:19, fontWeight:900, marginBottom:12 }}>
            {user?.name} {user?.role==="farmer"?t.farmerRole:t.industryRole}
          </div>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {(user?.role === "farmer"
              ? [[user?.earned||"₹0", t.earned],[user?.sold||"0 T", t.wasteSold],[user?.co2||"0 T", t.co2Saved]]
              : [[user?.deals||"0", t.activeDeals],[user?.sourced||"0 T", t.sourced],[user?.saved||"₹0", t.saved]]
            ).map(([v,l]) => (
              <div key={l}>
                <div style={{ fontSize:16, fontWeight:900, color:T.gold }}>{v}</div>
                <div style={{ fontSize:10, color:"#7ab897" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {tab==="waste"   && <WasteTab role={user?.role} user={user} myListings={myListings} setMyListings={setMyListings} myDeals={myDeals} setMyDeals={setMyDeals} lang={lang} />}
        {tab==="demand"  && <DemandTab lang={lang} />}
        {tab==="crop"    && <CropTab lang={lang} />}
        {tab==="market"  && <MarketTab lang={lang} />}
        {tab==="weather" && <WeatherTab lang={lang} />}
        {tab==="schemes" && <SchemesTab lang={lang} />}
        {tab==="calc"    && <CalcTab lang={lang} />}
        {tab==="chat"    && <ChatTab role={user?.role} user={user} chatHistory={chatHistory} setChatHistory={setChatHistory} lang={lang} />}
        {tab==="scanner" && <ScannerTab lang={lang} />}
        {tab==="leaderboard" && <LeaderboardTab lang={lang} />}
      </div>

      <VoiceNav setTab={setTab} lang={lang} />

      {/* Bottom Navigation */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:100,
        background:"#fff", borderTop:"1px solid #e8f5e9",
        boxShadow:"0 -4px 20px rgba(26,107,60,0.10)",
        display:"flex", justifyContent:"center", overflowX:"auto"
      }}>
        <div style={{ display:"flex", width:"100%", maxWidth:540, minWidth:"max-content" }}>
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => go(null, tb.id)} style={{
              flex:1, padding:"10px 4px 8px", border:"none",
              borderTop:`3px solid ${tab===tb.id ? T.green : "transparent"}`,
              background:"transparent",
              color: tab===tb.id ? T.green : "#bbb",
              cursor:"pointer", fontSize:9, fontWeight: tab===tb.id ? 800 : 400,
              display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              transition:"all 0.18s"
            }}>
              <span style={{ fontSize:20, transition:"transform 0.18s", transform: tab===tb.id ? "scale(1.18)" : "scale(1)" }}>{tb.icon}</span>
              <span style={{ whiteSpace:"nowrap", textOverflow:"ellipsis", overflow:"hidden", maxWidth:"100%" }}>{tb.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}                   
