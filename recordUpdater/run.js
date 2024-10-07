const fs = require('fs');
const path = require('path');
const fetch = require('cross-fetch');
const dotenv = require('dotenv').config();

const { DOMParser } = require('xmldom');
const convert = require('xml-js');
const xpath = require('xpath');

const targetFile = fs.readFileSync(path.join(__dirname, 'max_lit_sample.xml'), 'utf8');
const salt_los = require('../lo_stuff/salt_los');
const doc = new DOMParser().parseFromString(targetFile);

main().catch(err => console.error(err));

async function main() {
    await createContentRecord(doc);
}

async function createContentRecord(doc) {
    let lessonObj = {};
    let activityRecords = [];

    const lessonNode = xpath.select('//lesson', doc)[0];
    const activities = xpath.select('//activity', doc);

    const lessonTitle = xpath.select1('title', lessonNode).textContent;
    const lessonIntendedGrade = lessonNode.getAttribute('grade');
    const lessonIntendedUnit = lessonNode.getAttribute('unit');
    const lessonIntendedWeek = lessonNode.getAttribute('week');
    const lessonIntendedDay = lessonNode.getAttribute('day');
    const lessonIntendedLesson = lessonNode.getAttribute('lesson');
    const lessonType = xpath.select1('@type', lessonNode).value;
    const lessonDuration = xpath.select1('@duration', lessonNode).value;

    const lessonID = `G${lessonIntendedGrade}U${lessonIntendedUnit}W${lessonIntendedWeek}D${lessonIntendedDay}L${lessonIntendedLesson}`
    const parentTRS = returnTRSCode(lessonIntendedGrade, lessonIntendedUnit).ccode;

    lessonObj["title"] = lessonTitle;
    lessonObj["intended_grade"] = returnCUID('intended_grade', lessonIntendedGrade);
    lessonObj["intended_unit"] = returnCUID('intended_unit', lessonIntendedUnit);
    lessonObj["intended_week"] = returnCUID('intended_week', lessonIntendedWeek);
    lessonObj["intended_day"] = returnCUID('intended_day', lessonIntendedDay);
    lessonObj["lesson_number"] = returnCUID('lesson_number', lessonIntendedLesson);
    lessonObj["lesson_type"] = returnCUID('lesson_type', lessonType);
    lessonObj["lesson_time"] = returnCUID('lesson_time', lessonDuration);
    lessonObj["number_of_activities"] = returnCUID('number_of_activities', activities.length);

    for (let a = 0; a < activities.length; a++) {
        let currentActivity = activities[a];

        let title = xpath.select1('title', currentActivity).textContent;
        let id = currentActivity.getAttribute('number');
        let type = currentActivity.getAttribute('type');
        let duration = currentActivity.getAttribute('duration');

        let teacherModelOnPageOutcomes = !!xpath.select1('//learningOutcome[@type="Teacher Model On Page"]', currentActivity).textContent ? xpath.select1('//learningOutcome[@type="Teacher Model On Page"]', currentActivity).textContent : undefined;
        let teacherModelOffPageOutcomes = !!xpath.select1('//learningOutcome[@type="Teacher Model Off Page"]', currentActivity).textContent ? xpath.select1('//learningOutcome[@type="Teacher Model Off Page"]', currentActivity).textContent : undefined;
        let studentFocusOutcomes = !!xpath.select1('//learningOutcome[@type="Student Focus"]', currentActivity).textContent ? xpath.select1('//learningOutcome[@type="Student Focus"]', currentActivity).textContent : undefined;
        let studentSupportingOutcomes = !!xpath.select1('//learningOutcome[@type="Student Supporting"]', currentActivity).textContent ? xpath.select1('//learningOutcome[@type="Student Supporting"]', currentActivity).textContent : undefined;
        let studentReviewOutcomes = !!xpath.select1('//learningOutcome[@type="Student Review"]', currentActivity).textContent ? xpath.select1('//learningOutcome[@type="Student Review"]', currentActivity).textContent : undefined;

        activityRecords.push({
            "title": title,
            "activity_number": returnCUID('activity_number', id),
            "activity_type": returnCUID('activity_type', type),
            "activity_time": returnCUID('activity_time', duration),
            "teacher_model_on_page_outcome": teacherModelOnPageOutcomes.match(/(RL|RI|L|W|SL|RF)(\.)([A-Z]{1,4})(\.)(\d\d*)(\.)([a-z])*(\.)*(\d|K)*(\.)*([a-z]{1,4})*[^\s]+/g),
            "teacher_model_off_page_outcome": teacherModelOffPageOutcomes.match(/(RL|RI|L|W|SL|RF)(\.)([A-Z]{1,4})(\.)(\d\d*)(\.)([a-z])*(\.)*(\d|K)*(\.)*([a-z]{1,4})*[^\s]+/g),
            "student_focus_outcome": studentFocusOutcomes.match(/(RL|RI|L|W|SL|RF)(\.)([A-Z]{1,4})(\.)(\d\d*)(\.)([a-z])*(\.)*(\d|K)*(\.)*([a-z]{1,4})*[^\s]+/g),
            "student_supporting_outcome": studentSupportingOutcomes.match(/(RL|RI|L|W|SL|RF)(\.)([A-Z]{1,4})(\.)(\d\d*)(\.)([a-z])*(\.)*(\d|K)*(\.)*([a-z]{1,4})*[^\s]+/g),
            "student_review_outcome": studentReviewOutcomes.match(/(RL|RI|L|W|SL|RF)(\.)([A-Z]{1,4})(\.)(\d\d*)(\.)([a-z])*(\.)*(\d|K)*(\.)*([a-z]{1,4})*[^\s]+/g)
        });
    }

    createRecords(lessonObj, 'lesson', parentTRS)
    // console.log(lessonObj)
    // console.log(activityRecords)

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
            queryPath = `${process.env.MIA_CREATE_LESSON}${parentCode}`;
            apiURL = `${process.env.MIA_BASE_URL}${queryPath}`;

            console.log('Sending request for lesson:', {
                url: apiURL,
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ "lesson": obj }),
            });

            // try {
            //     const response = await fetch(apiURL, {
            //         method: 'POST',
            //         headers: headers,
            //         body: JSON.stringify({ "lesson": lessonObj }),
            //     });

            //     if (!response.ok) {
            //         throw new Error(`HTTP error! status: ${response.status}`);
            //     }

            //     const json = await response.json();
            //     console.log('Lesson creation response:', json);
            //     return json.data.lesson.code;
            // } catch (error) {
            //     console.error('Error creating lesson:', error);
            //     throw error;
            // }
            break;
        case 'activity':
            queryPath = `${process.env.MIA_UPDATE_ACTIVITY}/${parentCode}`;
            apiURL = `${process.env.MIA_BASE_URL}${queryPath}`;

            console.log('Sending request for activity:', {
                url: apiURL,
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ "activity": activityObj }),
            });

        // try {
        //     const response = await fetch(apiURL, {
        //         method: 'POST',
        //         headers: headers,
        //         body: JSON.stringify({ "activity": activityObj }),
        //     });

        //     if (!response.ok) {
        //         throw new Error(`HTTP error! status: ${response.status}`);
        //     }

        //     const json = await response.json();
        //     console.log('Activity creation response:', json);
        //     return json.data.activity.code;
        // } catch (error) {
        //     console.error('Error creating activity:', error);
        //     throw error;
        // }
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
                case 'Unit Wrap-Up':
                    cuid = 'A-CLESSONTYPE-00005';
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

function runMia(codes) {
    const queryPath = `/api/xs/content/retrieve`;

    const apiUrl = `${process.env.BASE_URL}${queryPath}`;

    const headers = {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
    };


    let data = { "contents": [] };
    if (!codes) {
        let requestCodes = fs.readFileSync(path.join(__dirname, 'codes.txt'), 'utf-8');
        requestCodes.split(/\n/).forEach(code => data["contents"].push(code));
    } else {
        if (typeof codes === 'string') {
            data["contents"].push(codes)
        } else {
            codes.forEach(code => data["contents"].push(code));
        }
    }
    
    const requestDetails = {
        url: apiUrl,
        method: 'POST',
        headers: headers,
        body: data,
    };
    
    // console.log('Sending request:', requestDetails);

    return fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error:', error);
        throw error;  // Rethrow error if needed to be caught by caller
    });
}