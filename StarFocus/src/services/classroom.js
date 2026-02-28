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
 * Fetch student submissions for a specific coursework item.
 * @param {string} accessToken
 * @param {string} courseId
 * @param {string} courseWorkId
 * @returns {Array} Array of submission objects
 */
export async function fetchSubmissions(accessToken, courseId, courseWorkId) {
    try {
        const response = await fetch(
            `${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await response.json();
        return data.studentSubmissions || [];
    } catch (error) {
        console.error(`Failed to fetch submissions:`, error);
        return [];
    }
}

/**
 * Full sync: Fetch all courses, their coursework, and submissions.
 * Transforms Classroom API data into StarFocus task format.
 * @param {string} accessToken
 * @returns {Array} Array of StarFocus-formatted task objects
 */
export async function fullSync(accessToken) {
    const courses = await fetchCourses(accessToken);
    const tasks = [];

    for (const course of courses) {
        const courseWork = await fetchCourseWork(accessToken, course.id);

        for (const work of courseWork) {
            // Build due date from Classroom's dueDate/dueTime format
            let dueDate = null;
            if (work.dueDate) {
                const { year, month, day } = work.dueDate;
                const time = work.dueTime || { hours: 23, minutes: 59 };
                dueDate = new Date(year, month - 1, day, time.hours || 23, time.minutes || 59).toISOString();
            }

            // Determine work type
            const workType = work.workType || 'ASSIGNMENT';

            // Fetch submission status
            const submissions = await fetchSubmissions(accessToken, course.id, work.id);
            const submission = submissions[0]; // User's submission
            const submissionStatus = submission?.state || 'NEW';

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
    fetchSubmissions,
    fullSync,
};
