const fs = require('fs');
const path = require('path');
const fetch = require('cross-fetch');
const dotenv = require('dotenv').config();

const { DOMParser } = require('xmldom');
const convert = require('xml-js');
const xpath = require('xpath');

let str = fs.readFileSync(path.join(path.resolve(homeFolder, 'transformations', sessionID), `${fileName.replace(/\..+?$/, '')}.xml`), 'utf8');

const doc = new DOMParser().parseFromString(str);

async function createContentRecord(doc, userName, time, submit) {
    let lessonRecord = {};
    let activityRecords = [];

    lessonRecord['divide'] = 'Lesson';

    let lessonTime = 0;
    let lessonPrimarySkills = [];
    let lessonPrimaryPracticeSkills = [];
    let lessonSecondarySkills = [];

    let lessonSlides = 0;
    let lessonRoutines = 0;
    let lessonProtocols = 0;
    let lessonOrganizers = 0;
    let lessonOffpage = 0;

    let metaNode = xpath.select('//fileMeta', doc);
    let lessonNode = xpath.select('//lesson', doc)[0];

    for (let i = 0; i < metaNode[0].childNodes.length; i++) {
        let currentNode = metaNode[0].childNodes[i];
        lessonRecord['Subcontent Type'] = 'Lesson';

        switch (currentNode.nodeName) {
            case 'program':
                lessonRecord['Originating Program'] = currentNode.childNodes[0].nodeValue.replace(/\s$/, '');
                break;
        }
    }

    let grade = lessonNode.getAttribute('grade');
    let unit = lessonNode.getAttribute('unit');
    let week = lessonNode.getAttribute('week');
    let day = lessonNode.getAttribute('day');
    let lessonNumber = lessonNode.getAttribute('lessonnumber');
    let lessonType = lessonNode.getAttribute('lessontype');
    let lessonTitle = lessonNode.getAttribute('lessontitle');
    let lessonSubcontentCode = `G${grade}U${unit}W${week}D${day}L${lessonNumber}`;

    lessonRecord['TRS Content Code'] = returnTRSCode(grade, unit).ccode;
    lessonRecord['Intended Grade'] = grade;
    lessonRecord['Intended Unit'] = unit;
    lessonRecord['Intended Week'] = week;
    lessonRecord['Intended Day'] = day;
    lessonRecord['Lesson Number'] = lessonNumber;
    lessonRecord['Lesson Type'] = lessonType;
    lessonRecord['Lesson Title'] = lessonTitle;
    lessonRecord['Lesson Subcontent Code'] = lessonSubcontentCode;

    let activities = xpath.select('//activity', doc);
    lessonRecord['# of Activities'] = activities.length;

    for (let a = 0; a < activities.length; a++) {
        let currentActivity = activities[a];

        let title = currentActivity.getAttribute('title');
        let id = currentActivity.getAttribute('id');
        let type;
        // let activityCode = 0000000;
        let duration;
        let slides = 0;
        let protocols = 0;
        let routines = 0;
        let organizers = 0;
        let offpageContent = 0;
        let mode;
        let primaryLearningOutcomes = [];
        let primaryPracticeLearningOutcomes = [];
        let secondaryLearningOutcomes = [];

        let sections = xpath.select('section', currentActivity);

        sections.forEach(sec => {
            const select = xpath.useNamespaces({ "aid": "http://ns.adobe.com/AdobeInDesign/4.0/" });

            let secSlides = select(".//p[@aid:pstyle='becslidespec']", sec).length;
            let secProtocols = select(".//p[@aid:pstyle='becprotocol']", sec).length;
            let secRoutines = select(".//p[@aid:pstyle='routine']", sec).length;
            let graphicOrganizers = select(".//p[@aid:pstyle='becgraphicorganizer']", sec).length;
            let offpage = select(".//p[@aid:pstyle='becoffpage']", sec).length;

            slides += secSlides;
            protocols += secProtocols;
            routines += secRoutines;
            organizers += graphicOrganizers;
            offpageContent += offpage;
        });

        let dataElements = xpath.select('activityData/data', currentActivity);

        dataElements.forEach((dataElement, index) => {
            let dataText = dataElement.firstChild.data.trim();

            switch (dataElement.getAttribute('outputclass').replace(/bec/, '')) {
                case 'activitytype':
                    type = dataText.replace(/\s$/, '');
                    break;
                case 'activityduration':
                    duration = dataText.replace(/(^\d\d*)(\s|-|–)*(\d|\s)*(min+?$)/, '$1');
                    break;
                // case 'activitycontentcode':                    
                //     activityCode = dataText.replace(/\s$/, '');
                //     break;
                case 'primaryskills':
                    primaryLearningOutcomes.push(dataText.replace(/\s$/, ''));
                    break;
                case 'primarypracticeskills':
                    primaryPracticeLearningOutcomes.push(dataText.replace(/\s$/, ''));
                    break;
                case 'secondaryskills':
                    secondaryLearningOutcomes.push(dataText.replace(/\s$/, ''));
                    break;
            }
        });

        activityRecords.push({
            'divide': 'Activities',
            'Activity Subcontent Code': `${lessonSubcontentCode}${id}`,
            'Activity Title': title,
            'Activity Number': id.replace(/A/, ''),
            'Activity Type': type ? type : '',
            'Activity Instructional Mode': mode ? mode : '',
            'Activity Time': duration ? duration : 0,
            '# of Slides': slides ? slides : 0,
            '# of Protocols': protocols ? protocols : 0,
            '# of Routines': routines ? routines : 0,
            '# of Organizers': organizers ? organizers : 0,
            '# of Off-Page Resources': offpageContent ? offpageContent : 0,
            'Primary Learning Outcomes': primaryLearningOutcomes.length > 0 ? primaryLearningOutcomes.join(' ') : '',
            'Primary Practice Learning Outcomes': primaryPracticeLearningOutcomes.length > 0 ? primaryPracticeLearningOutcomes.join(' ') : '',
            'Secondary Learning Outcomes': secondaryLearningOutcomes.length > 0 ? secondaryLearningOutcomes.join(' ') : '',
            'Created At': time,
            'Created By': userName
        });

        primaryLearningOutcomes.length > 0 ? lessonPrimarySkills.push(primaryLearningOutcomes) : false;
        primaryPracticeLearningOutcomes.length > 0 ? lessonPrimaryPracticeSkills.push(primaryPracticeLearningOutcomes) : false;
        secondaryLearningOutcomes.length > 0 ? lessonSecondarySkills.push(secondaryLearningOutcomes) : false;

        lessonSlides += slides !== '' ? slides : false;
        lessonProtocols += protocols !== '' ? protocols : false;
        lessonRoutines += routines !== '' ? routines : false;
        lessonOrganizers += organizers !== '' ? organizers : false;
        lessonOffpage += offpageContent !== '' ? offpageContent : false;
        lessonTime += duration !== '' ? Number(duration) : false;
        // activityCode++;
    }

    lessonPrimarySkills = new Set(lessonPrimarySkills.flat());
    lessonPrimaryPracticeSkills = new Set(lessonPrimaryPracticeSkills.flat());
    lessonSecondarySkills = new Set(lessonSecondarySkills.flat());

    lessonRecord['# of Slides'] = lessonSlides;
    lessonRecord['# of Protocols'] = lessonProtocols;
    lessonRecord['# of Routines'] = lessonRoutines;
    lessonRecord['# of Organizers'] = lessonOrganizers;
    lessonRecord['# of Off-Page Resources'] = lessonOffpage;
    lessonRecord['Lesson Time'] = lessonTime;
    lessonRecord['Primary Learning Outcomes'] = Array.from(lessonPrimarySkills).join(', ');
    lessonRecord['Primary Practice Learning Outcomes'] = Array.from(lessonPrimaryPracticeSkills).join(', ');
    lessonRecord['Secondary Learning Outcomes'] = Array.from(lessonSecondarySkills).join(', ');
    lessonRecord['Created At'] = time;
    lessonRecord['Created By'] = userName;

    if (submit) {
        let lessonSubcontentCode;

        try {
            console.log('going to create lesson records...');
            console.log(returnTRSCode(grade, unit).ccode)
            lessonSubcontentCode = await createRecords(lessonRecord, 'lesson', returnTRSCode(grade, unit).ccode);
            // lessonSubcontentCode = 'SC-00109157';
        } catch (e) {
            console.log(`createRecords error being handled: ${e}`);
            throw new Error(e.message);
        }

        for (const activityRecord of activityRecords) {
            try {
                console.log('going to create activity records...');
                await createRecords(activityRecord, 'activity', lessonSubcontentCode);
            } catch (e) {
                console.log(`createRecords error being handled: ${e}`);
                throw new Error(e.message);
            }
        }
    }

    return [lessonRecord, activityRecords];
}

async function createRecords(obj, type, parentCode) {
    let queryPath = '';
    let apiURL = '';

    const headers = {
        'Authorization': `Bearer ${process.env.MIA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
    };

    let lessonObj = {};
    let activityObj = {};

    let primaryOutcomes = [];
    let primaryPracticeOutcomes = [];
    let secondaryOutcomes = [];

    switch (type) {
        case 'lesson':
            queryPath = `/api/xs/content/create-lesson/${parentCode}`;
            apiURL = `${process.env.MIA_BASE_URL}${queryPath}`;

            lessonObj["title"] = obj["Lesson Title"];
            lessonObj["intended_grade"] = returnCUID('intended_grade', obj["Intended Grade"]);
            lessonObj["intended_unit"] = returnCUID('intended_unit', obj["Intended Unit"]);
            lessonObj["intended_week"] = returnCUID('intended_week', obj["Intended Week"]);
            lessonObj["intended_day"] = returnCUID('intended_day', obj["Intended Day"]);
            lessonObj["lesson_number"] = returnCUID('lesson_number', obj["Lesson Number"]);
            lessonObj["lesson_type"] = returnCUID('lesson_type', obj["Lesson Type"]);
            lessonObj["lesson_time"] = returnCUID('lesson_time', obj["Lesson Time"]);
            lessonObj["number_of_activities"] = returnCUID('number_of_activities', obj["# of Activities"]);

            console.log('Sending request for lesson:', {
                url: apiURL,
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ "lesson": lessonObj }),
            });

            try {
                const response = await fetch(apiURL, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ "lesson": lessonObj }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const json = await response.json();
                console.log('Lesson creation response:', json);
                return json.data.lesson.code;
            } catch (error) {
                console.error('Error creating lesson:', error);
                throw error;
            }
        case 'activity':
            queryPath = `/api/xs/content/create-activity/${parentCode}`;
            apiURL = `${process.env.MIA_BASE_URL}${queryPath}`;

            activityObj["title"] = obj["Activity Title"];
            activityObj["activity_number"] = returnCUID('activity_number', obj["Activity Number"]);
            activityObj["activity_type"] = returnCUID('activity_type', obj["Activity Type"]);
            activityObj["activity_time"] = returnCUID('activity_time', obj["Activity Time"]);

            obj["Primary Learning Outcomes"].split(',').forEach(lo => {
                for (let o = 0; o < fullTaxonomy["Learning Outcome"].length; o++) {
                    let outcome = fullTaxonomy["Learning Outcome"][o];

                    if (outcome.humanCodingScheme === lo.replace(/\s/g, '')) {
                        primaryOutcomes.push({
                            "human_readable_code": outcome.humanCodingScheme,
                            "primary_learning_outcome_cuid": outcome.identifier
                        });
                    }
                }

                if (primaryOutcomes.length === 0 && obj["Primary Learning Outcomes"].split(',').length > 0) {
                    throw new Error('There was an error with the Learning Outcomes during content record creation. Please check that all LOs are valid.');
                }
            });

            obj["Secondary Learning Outcomes"].split(',').forEach(lo => {
                for (let o = 0; o < fullTaxonomy["Learning Outcome"].length; o++) {
                    let outcome = fullTaxonomy["Learning Outcome"][o];

                    if (outcome.humanCodingScheme === lo.replace(/\s/g, '')) {
                        secondaryOutcomes.push({
                            "human_readable_code": outcome.humanCodingScheme,
                            "secondary_learning_outcome_cuid": outcome.identifier
                        });
                    }
                }

                if (secondaryOutcomes.length === 0 && obj["Secondary Learning Outcomes"].split(',').length > 0) {
                    throw new Error('There was an error with the Learning Outcomes during content record creation. Please check that all LOs are valid.');
                }
            });

            activityObj["primary_learning_outcomes"] = primaryOutcomes;
            activityObj["secondary_learning_outcomes"] = secondaryOutcomes;

            console.log('Sending request for activity:', {
                url: apiURL,
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ "activity": activityObj }),
            });

            try {
                const response = await fetch(apiURL, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ "activity": activityObj }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const json = await response.json();
                console.log('Activity creation response:', json);
                return json.data.activity.code;
            } catch (error) {
                console.error('Error creating activity:', error);
                throw error;
            }
    }
}

function returnCUID(attribute, value) {
    // const { value, attribute } = req.params;
    let cuid = '';
    let newValue;
    value = String(value);

    switch (attribute) {
        // case 'intended_program':
        //     break;
        case 'intended_grade':
            cuid += 'A-CINTENDEDGRADE-00000';
            if (value.toLowerCase() != 'k') {
                cuid = cuid.slice(0, -value.length);
                cuid += value
            }
            break;
        case 'intended_unit':
            cuid += 'A-CINTENDEDUNIT-00000';
            cuid = cuid.slice(0, -value.length);
            cuid += value
            break;
        case 'intended_week':
            cuid += 'A-CINTENDEDWEEK-00000';
            cuid = cuid.slice(0, -value.length);
            cuid += value
            break;
        case 'intended_day':
            cuid += 'A-CINTENDEDDAY-00000';
            value = value.replace(/day /i, '');
            cuid = cuid.slice(0, -value.length);
            cuid += value
            break;
        case 'lesson_number':
            cuid += 'A-CLESSONNUMBER-00000';
            cuid = cuid.slice(0, -value.length);
            cuid += value
            break;
        case 'lesson_time':
            cuid += 'A-CLESSONTIME-00000';
            value = String(value)
            newValue = '';

            if (value.match(/min/)) {
                newValue = value.replace(/(\s)*(min)(s)*(\.)*/i, '')
            } else {
                newValue = value;
            }

            switch (newValue) {
                case '20':
                    newValue = '1';
                    break;
                case '25':
                    newValue = '2';
                    break;
                case '30':
                    newValue = '3';
                    break;
                case '35':
                    newValue = '4';
                    break;
                case '40':
                    newValue = '5';
                    break;
                case '45':
                    newValue = '6';
                    break;
                case '50':
                    newValue = '7';
                    break;
                case '55':
                    newValue = '8';
                    break;
                case '60':
                    newValue = '9';
                    break;
                default:
                    throw new Error(`Invalid value for attribute ${attribute}: ${value} (${newValue})`)
            }

            cuid = cuid.slice(0, -newValue.length);
            cuid += newValue;
            break;
        case 'lesson_type':
            switch (value) {
                case 'Unit Introduction':
                    cuid = 'A-CLESSONTYPE-00001';
                    break;
                case 'Read to Build Knowledge':
                    cuid = 'A-CLESSONTYPE-00002';
                    break;
                case 'Write to Build Knowledge':
                    cuid = 'A-CLESSONTYPE-00003';
                    break;
                case 'Phonics & Word Study':
                    cuid = 'A-CLESSONTYPE-00004';
                    break;
            }
            break;
        case 'number_of_activities':
            cuid += 'A-CNUMBEROFACTIVITIES-00000';
            cuid = cuid.slice(0, -value.length);
            cuid += value;
            break;
        case 'activity_number':
            cuid += 'A-CACTIVITYNUMBER-00000';
            cuid = cuid.slice(0, -value.length);
            cuid += value
            break;
        case 'activity_time':
            cuid += 'A-CACTIVITYTIME-00000';
            cuid = cuid.slice(0, -value.length);
            cuid += value
            break;
        case 'activity_type':
            switch (value) {
                case 'Multimedia':
                    cuid = 'A-CACTIVITYTYPE-00001';
                    break;
                case 'Vocabulary':
                    cuid = 'A-CACTIVITYTYPE-00002';
                    break;
                case 'Read to Build Knowledge':
                    cuid = 'A-CACTIVITYTYPE-00003';
                    break;
                case 'Answer Questions':
                    cuid = 'A-CACTIVITYTYPE-00004';
                    break;
            }
            break;
    }

    // console.log(`Value: ${value}, Attribute: ${attribute}, CUID: ${cuid}`);

    // Example response
    // res.status(200).json(cuid);
    return cuid;
}

function returnTRSCode(grade, unit) {
    let ccode = '';
    let ycode = '';

    switch (grade + unit) {
        case 'K1':
            ccode = 'C-00111917';
            ycode = 'Y66591';
            break;
        case 'K2':
            ccode = 'C-00111918';
            ycode = 'Y66592';
            break;
        case 'K3':
            ccode = 'C-00111919';
            ycode = 'Y66593';
            break;
        case 'K4':
            ccode = 'C-00111920';
            ycode = 'Y66594';
            break;
        case 'K5':
            ccode = 'C-00111921';
            ycode = 'Y66595';
            break;
        case 'K6':
            ccode = 'C-00111922';
            ycode = 'Y66596';
            break;
        case 'K7':
            ccode = 'C-00111923';
            ycode = 'Y66597';
            break;
        case 'K8':
            ccode = 'C-00111924';
            ycode = 'Y66598';
            break;
        case '11':
            ccode = 'C-00111925';
            ycode = 'Y66599';
            break;
        case '12':
            ccode = 'C-00111926';
            ycode = 'Y66600';
            break;
        case '13':
            ccode = 'C-00111927';
            ycode = 'Y66601';
            break;
        case '14':
            ccode = 'C-00111928';
            ycode = 'Y66602';
            break;
        case '15':
            ccode = 'C-00111929';
            ycode = 'Y66603';
            break;
        case '16':
            ccode = 'C-00111930';
            ycode = 'Y66604';
            break;
        case '17':
            ccode = 'C-00111931';
            ycode = 'Y66605';
            break;
        case '18':
            ccode = 'C-00111932';
            ycode = 'Y66606';
            break;
        case '21':
            ccode = 'C-00111933';
            ycode = 'Y66607';
            break;
        case '22':
            ccode = 'C-00111934';
            ycode = 'Y66608';
            break;
        case '23':
            ccode = 'C-00111935';
            ycode = 'Y66609';
            break;
        case '24':
            ccode = 'C-00111936';
            ycode = 'Y66610';
            break;
        case '25':
            ccode = 'C-00111937';
            ycode = 'Y66611';
            break;
        case '26':
            ccode = 'C-00111938';
            ycode = 'Y66612';
            break;
        case '27':
            ccode = 'C-00111939';
            ycode = 'Y66613';
            break;
        case '28':
            ccode = 'C-00111940';
            ycode = 'Y66614';
            break;
        case '31':
            ccode = 'C-00111941';
            ycode = 'Y66615';
            break;
        case '32':
            ccode = 'C-00111942';
            ycode = 'Y66616';
            break;
        case '33':
            ccode = 'C-00111943';
            ycode = 'Y66617';
            break;
        case '34':
            ccode = 'C-00111944';
            ycode = 'Y66618';
            break;
        case '35':
            ccode = 'C-00111945';
            ycode = 'Y66619';
            break;
        case '36':
            ccode = 'C-00111946';
            ycode = 'Y66620';
            break;
        case '37':
            ccode = 'C-00111947';
            ycode = 'Y66621';
            break;
        case '38':
            ccode = 'C-00111948';
            ycode = 'Y66622';
            break;
        case '41':
            ccode = 'C-00111949';
            ycode = 'Y66623';
            break;
        case '42':
            ccode = 'C-00111950';
            ycode = 'Y66624';
            break;
        case '43':
            ccode = 'C-00111951';
            ycode = 'Y66625';
            break;
        case '44':
            ccode = 'C-00111952';
            ycode = 'Y66626';
            break;
        case '45':
            ccode = 'C-00111953';
            ycode = 'Y66627';
            break;
        case '46':
            ccode = 'C-00111954';
            ycode = 'Y66628';
            break;
        case '47':
            ccode = 'C-00111955';
            ycode = 'Y66629';
            break;
        case '48':
            ccode = 'C-00111956';
            ycode = 'Y66630';
            break;
        case '51':
            ccode = 'C-00111957';
            ycode = 'Y66631';
            break;
        case '52':
            ccode = 'C-00111958';
            ycode = 'Y66632';
            break;
        case '53':
            ccode = 'C-00111959';
            ycode = 'Y66633';
            break;
        case '54':
            ccode = 'C-00111960';
            ycode = 'Y66634';
            break;
        case '55':
            ccode = 'C-00111961';
            ycode = 'Y66635';
            break;
        case '56':
            ccode = 'C-00111962';
            ycode = 'Y66636';
            break;
        case '57':
            ccode = 'C-00111963';
            ycode = 'Y66637';
            break;
        case '58':
            ccode = 'C-00111964';
            ycode = 'Y66638';
            break;
    }

    return { ccode: ccode, ycode: ycode }
}