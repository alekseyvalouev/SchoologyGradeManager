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

chrome.tabs.onActivated.addListener(function(activeInfo) {
    handleBrowserActionClicked();
});

async function handleBrowserActionClicked() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: readPage,
    });
}


