function readPage() {
    url = window.location.href;
    const urlInfo = url.split("/");

    if (urlInfo.includes("grades") && urlInfo[2].includes("schoology")) {
        var doc = new DOMParser().parseFromString(document.body.outerHTML, "text/html");
        var grades = [];
        var courses = [];
        
        var classElements = doc.getElementsByClassName("gradebook-course hierarchical-grading-report show-title interactive sGradesGradebook-processed sGradeHierarchicalReport-processed");

        for (let j = 0; j < classElements.length; j++) {

            var gradeElements = classElements[j].getElementsByClassName("report-row period-row has-children");

            var gradeSubArr = [];

            for (let i = 0; i < gradeElements.length; i++) {
                if (gradeElements[i].getElementsByClassName('awarded-grade').length > 0) {
                    gradeSubArr.push(gradeElements[i].getElementsByClassName('awarded-grade')[0].textContent);
                } else {
                    gradeSubArr.push("None");
                }
            }

            grades.push(gradeSubArr);

            var courseNameElements = classElements[j].getElementsByClassName("gradebook-course-title");
            var courseSubArr = [];
            for (let i = 0; i < courseNameElements.length; i++) {
                courseSubArr.push(courseNameElements[i].textContent.replace('Course', ''));
            }

            courses.push(courseSubArr);

        }

        chrome.storage.sync.set({classes: courses, classGrades: grades});

    }
}

function calculateGPA() {
    chrome.storage.sync.get(['classGrades', 'classes'], function(result) {
        Object.assign(grades, result.classGrades);
        Object.assign(courses, result.classes);

        let gpaTotal = 0;
        let courseTotal = 0;

        let gpaArray = [];
        let courseTotalArray = [];
    
        for (let i = 0; i < courses.length; i++) {
            let found = false;
            if (grades[i].length > 0) {
                for (let j = 0; j < grades[i].length; j++) {
                    if (grades[i][j].includes("A+")) {
                        gpaTotal+=4;
                        found = true;
                    } else if (grades[i][j].includes("A") && !grades[i][j].includes("A-")) {
                        gpaTotal+=4;
                        found = true;
                    } else if (grades[i][j].includes("A-")) {
                        gpaTotal+=3.7;
                        found = true;
                    } else if (grades[i][j].includes("B+")) {
                        gpaTotal+=3.3;
                        found = true;
                    } else if (grades[i][j].includes("B") && !grades[i][j].includes("B-")) {
                        gpaTotal+=3.0;
                        found = true;
                    } else if (grades[i][j].includes("B-")) {
                        gpaTotal+=2.7;
                        found = true;
                    } else if (grades[i][j].includes("C+")) {
                        gpaTotal+=2.3;
                        found = true;
                    } else if (grades[i][j].includes("C") && !grades[i][j].includes("C-")) {
                        gpaTotal+=2.0;
                        found = true;
                    } else if (grades[i][j].includes("C")) {
                        gpaTotal+=1.7;
                        found = true;
                    } else if (grades[i][j].includes("D+")) {
                        gpaTotal+=1.3;
                        found = true;
                    } else if (grades[i][j].includes("D") && !grades[i][j].includes("D-")) {
                        gpaTotal+=1.0;
                        found = true;
                    } else if (grades[i][j].includes("D-")) {
                        gpaTotal+=0.7;
                        found = true;
                    } else if (grades[i][j].includes("F")) {
                        found = true;
                    }
                    if (!found) {
                        let resString = parseFloat(grades[i][j]);
                        if (grades[i][j].indexOf("%") != -1) {
                            if (resString <= 4) {
                                resString = resString*25
                            }
                            if (resString >= 92) {
                                gpaTotal+=4;
                                found = true;
                            } else if (resString >= 90) {
                                gpaTotal+=3.7;
                                found = true;
                            } else if (resString >= 87) {
                                gpaTotal+=3.3;
                                found = true;
                            } else if (resString >= 83) {
                                gpaTotal+=3.0;
                                found = true;
                            } else if (resString >= 80) {
                                gpaTotal+=2.7;
                                found = true;
                            } else if (resString >= 77) {
                                gpaTotal+=2.3;
                                found = true;
                            } else if (resString >= 73) {
                                gpaTotal+=2.0;
                                found = true;
                            } else if (resString >= 70) {
                                gpaTotal+=1.7;
                                found = true;
                            } else if (resString >= 67) {
                                gpaTotal+=1.3;
                                found = true;
                            } else if (resString >= 63) {
                                gpaTotal+=1.0;
                                found = true;
                            } else if (resString >= 60) {
                                gpaTotal+=0.7;
                                found = true;
                            } else {
                                found = true;
                            }
                        } else {
                            if (resString <= 4) {
                                resString = resString*20
                            }
                            if (resString >= 92) {
                                gpaTotal+=4;
                                found = true;
                            } else if (resString >= 90) {
                                gpaTotal+=3.7;
                                found = true;
                            } else if (resString >= 87) {
                                gpaTotal+=3.3;
                                found = true;
                            } else if (resString >= 83) {
                                gpaTotal+=3.0;
                                found = true;
                            } else if (resString >= 80) {
                                gpaTotal+=2.7;
                                found = true;
                            } else if (resString >= 77) {
                                gpaTotal+=2.3;
                                found = true;
                            } else if (resString >= 73) {
                                gpaTotal+=2.0;
                                found = true;
                            } else if (resString >= 70) {
                                gpaTotal+=1.7;
                                found = true;
                            } else if (resString >= 67) {
                                gpaTotal+=1.3;
                                found = true;
                            } else if (resString >= 63) {
                                gpaTotal+=1.0;
                                found = true;
                            } else if (resString >= 60) {
                                gpaTotal+=0.7;
                                found = true;
                            } else {
                                found = true;
                            }
                            //alert("An error occurred calculating your GPA, result may not be accurate.");
                            //alert(grades[i][0]);
                        }
                    }
                    if (found) {
                        if (typeof gpaArray[j] == 'undefined') {
                            gpaArray[j]=gpaTotal;
                            courseTotalArray[j]=1;
                        } else {
                            gpaArray[j]+=gpaTotal;
                            courseTotalArray[j]+=1;
                        }
                        gpaTotal=0;
                    }
                }
            }
        }
        let finalArr = [];
        for (let i = 0; i < gpaArray.length; i++) {
            finalArr[i] =  String(Math.round((gpaArray[i]/courseTotalArray[i]) * 10) / 10)
        }
        chrome.storage.sync.set({"gpaNoWeight" : finalArr});
    
    });
}

chrome.storage.onChanged.addListener(function (changes, namespace) {

    var courses;
    var grades;
    let gpaNoWeight;

    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
            if (key == 'classes') {
                courses = newValue;
            } else if (key == 'classGrades') {
                grades = newValue;
            } else if (key == 'gpaNoWeight') {
                gpaNoWeight = newValue;
            }
    }
    if (courses != undefined) {
        let resString = "";
        for (let i = 0; i < courses.length; i++) {
            resString+=("Course: " + courses[i] + "\n");
            for (let j = 0; j < grades[i].length; j++) {
                resString+=("<li>Grading Period " + String(j+1) + ": " + grades[i][j] + "</li>\n");
            }
        }
        document.getElementById("gradesummary").innerHTML = resString;
    }

    if (gpaNoWeight != undefined) {
        let finalStr = "";
        for (let i = 0; i < gpaNoWeight.length; i++) {
            finalStr+="<li>Grading Period " + String(i+1) + " Unweighted: " + gpaNoWeight[i] + "</li>\n";
        }
        document.getElementById("unweighted").innerHTML = finalStr;
    }
});

let courses = [];
let grades = [];
let unweightedGpa = [];

chrome.storage.sync.get(['classGrades', 'classes', 'gpaNoWeight'], function(result) {
    Object.assign(grades, result.classGrades);
    Object.assign(courses, result.classes);

    let resString = "";
    for (let i = 0; i < courses.length; i++) {
        if (grades[i].length > 0) {
            resString+=("<b>Course: " + courses[i] + "</b>\n");
            for (let j = 0; j < grades[i].length; j++) {
                resString+=("<li>Grading Period " + String(j+1) + ": " + grades[i][j] + "</li>\n");
            }
        }
    }
    document.getElementById("gradesummary").innerHTML = resString;
    
    if (result.gpaNoWeight != null) {
        Object.assign(unweightedGpa, result.gpaNoWeight);
        let finalStr = "";
        for (let i = 0; i < unweightedGpa.length; i++) {
            finalStr+="<li>Grading Period " + String(i+1) + " Unweighted: " + unweightedGpa[i] + "</li>\n";
        }
        document.getElementById("unweighted").innerHTML = finalStr;
    }

});

document.getElementById("getgrades").addEventListener("click", async () => {

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: readPage,
    });
});

//TODO: REMOVE THIS
document.getElementById("resetbtn").addEventListener("click", async () => {
    chrome.storage.sync.set({classes: [], classGrades: []});
});

document.getElementById("gpacalculator").addEventListener("click", () => {
    calculateGPA();
});
