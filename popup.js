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

        let letterGrades = ['A', 'B', 'C', 'D', 'F'];

        //let gradeChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
    
        for (let i = 0; i < courses.length; i++) {
            let found = false;
            if (grades[i].length > 0) {
                if (grades[i][0].includes("A+")) {
                    gpaTotal+=4;
                    found = true;
                } else if (grades[i][0].includes("A") && !grades[i][0].includes("A-")) {
                    gpaTotal+=4;
                    found = true;
                } else if (grades[i][0].includes("A-")) {
                    gpaTotal+=3.7;
                    found = true;
                } else if (grades[i][0].includes("B+")) {
                    gpaTotal+=3.3;
                    found = true;
                } else if (grades[i][0].includes("B") && !grades[i][0].includes("B-")) {
                    gpaTotal+=3.0;
                    found = true;
                } else if (grades[i][0].includes("B-")) {
                    gpaTotal+=2.7;
                    found = true;
                } else if (grades[i][0].includes("C+")) {
                    gpaTotal+=2.3;
                    found = true;
                } else if (grades[i][0].includes("C") && !grades[i][0].includes("C-")) {
                    gpaTotal+=2.0;
                    found = true;
                } else if (grades[i][0].includes("C")) {
                    gpaTotal+=1.7;
                    found = true;
                } else if (grades[i][0].includes("D+")) {
                    gpaTotal+=1.3;
                    found = true;
                } else if (grades[i][0].includes("D") && !grades[i][0].includes("D-")) {
                    gpaTotal+=1.0;
                    found = true;
                } else if (grades[i][0].includes("D-")) {
                    gpaTotal+=0.7;
                    found = true;
                } else if (grades[i][0].includes("F")) {
                    found = true;
                }
                if (!found) {
                    if (grades[i][0].indexOf("%") != -1) {
                        let resString = parseFloat(grades[i][0]);
                        
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
                        alert("An error occurred calculating your GPA, result may not be accurate.");
                        alert(grades[i][0]);
                    }
                }
                if (found) {
                    courseTotal+=1;
                }
            }
        }
        chrome.storage.sync.set({"gpaNoWeight" : String(Math.round((gpaTotal/courseTotal) * 10) / 10)});
    
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
                resString+=("Grading Period " + String(j+1) + ": " + grades[i][j] + "\n");
            }
        }
        document.getElementById("gradesummary").innerText = resString;
    }

    if (gpaNoWeight != undefined) {
        document.getElementById("unweighted").innerText = "Unweighted: " + gpaNoWeight;
    }
});

let courses = [];
let grades = [];
let unweightedGpa;

chrome.storage.sync.get(['classGrades', 'classes', 'gpaNoWeight'], function(result) {
    Object.assign(grades, result.classGrades);
    Object.assign(courses, result.classes);

    let resString = "";
    for (let i = 0; i < courses.length; i++) {
        if (grades[i].length > 0) {
            resString+=("Course: " + courses[i] + "\n");
            for (let j = 0; j < grades[i].length; j++) {
                resString+=("Grading Period " + String(j+1) + ": " + grades[i][j] + "\n");
            }
        }
    }

    document.getElementById("gradesummary").innerText = resString;
    if (result.gpaNoWeight != null) {
        unweightedGpa = result.gpaNoWeight;
        document.getElementById("unweighted").innerText = "Unweighted: " + unweightedGpa;
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