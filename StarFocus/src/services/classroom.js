// Google Classroom API Service
// Makes REST calls with the user's access token to fetch tasks and quizzes

const CLASSROOM_BASE_URL = 'https://classroom.googleapis.com/v1';

/**
 * Fetch all courses for the authenticated user.
 * @param {string} accessToken - Google OAuth access token
 * @returns {Array} Array of course objects
 */
export async function fetchCourses(accessToken) {
    try {
        const response = await fetch(`${CLASSROOM_BASE_URL}/courses?courseStates=ACTIVE`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        return data.courses || [];
    } catch (error) {
        console.error('Failed to fetch courses:', error);
        return [];
    }
}

/**
 * Fetch coursework (assignments + quizzes) for a specific course.
 * @param {string} accessToken
 * @param {string} courseId
 * @returns {Array} Array of coursework items
 */
export async function fetchCourseWork(accessToken, courseId) {
    try {
        const response = await fetch(
            `${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork?orderBy=dueDate desc`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await response.json();
        return data.courseWork || [];
    } catch (error) {
        console.error(`Failed to fetch coursework for ${courseId}:`, error);
        return [];
    }
}

/**
 * Fetch ALL student submissions for a course in a single API call.
 * Uses courseWorkId='-' which is the Classroom API batch wildcard.
 * Fixes the previous N+1 pattern (one request per assignment).
 * @param {string} accessToken
 * @param {string} courseId
 * @returns {Object} Map of courseWorkId -> submission state
 */
export async function fetchAllSubmissionsForCourse(accessToken, courseId) {
    try {
        const response = await fetch(
            `${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork/-/studentSubmissions?states=TURNED_IN`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await response.json();
        const submissionMap = {};
        for (const sub of data.studentSubmissions || []) {
            submissionMap[sub.courseWorkId] = sub.state;
        }
        return submissionMap;
    } catch (error) {
        console.error(`Failed to batch-fetch submissions for course ${courseId}:`, error);
        return {};
    }
}

/**
 * Full sync: Fetch all courses, their coursework, and submissions.
 * Uses a single batch submission fetch per course (previously N+1 calls).
 * Transforms Classroom API data into StarFocus task format.
 * @param {string} accessToken
 * @returns {Array} Array of StarFocus-formatted task objects
 */
export async function fullSync(accessToken) {
    const courses = await fetchCourses(accessToken);
    const tasks = [];

    for (const course of courses) {
        // Fetch all coursework AND all submissions in parallel — 2 calls per course max
        const [courseWork, submissionMap] = await Promise.all([
            fetchCourseWork(accessToken, course.id),
            fetchAllSubmissionsForCourse(accessToken, course.id),
        ]);

        for (const work of courseWork) {
            // Build due date from Classroom's dueDate/dueTime format
            let dueDate = null;
            if (work.dueDate) {
                const { year, month, day } = work.dueDate;
                const time = work.dueTime || { hours: 23, minutes: 59 };
                dueDate = new Date(year, month - 1, day, time.hours || 23, time.minutes || 59).toISOString();
            }

            const workType = work.workType || 'ASSIGNMENT';
            const submissionStatus = submissionMap[work.id] || 'NEW';

            tasks.push({
                id: work.id,
                courseId: course.id,
                courseName: course.name,
                title: work.title,
                description: work.description || '',
                dueDate,
                workType,
                gradeWeightage: 0.5, // Default — user can override
                completionPercent: submissionStatus === 'TURNED_IN' ? 100 : 0,
                submissionStatus,
                source: 'classroom',
            });
        }
    }

    return tasks;
}

export default {
    fetchCourses,
    fetchCourseWork,
    fetchAllSubmissionsForCourse,
    fullSync,
};
