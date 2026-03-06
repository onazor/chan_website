// Fetch LeetCode problems from GitHub repository
const GITHUB_API = 'https://api.github.com/repos/onazor/LeetCode/contents';
const GITHUB_COMMITS_API = 'https://api.github.com/repos/onazor/LeetCode/commits';

// Problem difficulty mapping (based on LeetCode problem numbers)
const difficultyMap = {
    // Easy problems
    '0069': 'Easy', '0118': 'Easy', '0169': 'Easy', '0190': 'Easy', '0197': 'Easy',
    '0290': 'Easy', '0292': 'Easy', '0344': 'Easy', '0367': 'Easy', '0401': 'Easy',
    '0441': 'Easy', '0693': 'Easy', '0696': 'Easy', '0762': 'Easy', '0868': 'Easy',
    '1304': 'Easy', '1356': 'Easy', '1518': 'Easy', '1758': 'Easy', '1784': 'Easy',
    '1957': 'Easy', '2011': 'Easy', '2210': 'Easy', '2221': 'Easy',
    
    // Medium problems
    '0011': 'Medium', '0022': 'Medium', '0038': 'Medium', '0043': 'Medium', '0048': 'Medium',
    '0049': 'Medium', '0068': 'Medium', '0799': 'Medium', '0898': 'Medium', '0904': 'Medium',
    '1022': 'Medium', '1382': 'Medium', '1404': 'Medium', '1461': 'Medium', '1536': 'Medium',
    '1545': 'Medium', '1582': 'Medium', '1689': 'Medium', '1717': 'Medium', '2044': 'Medium',
    '2106': 'Medium', '2411': 'Medium', '2419': 'Medium', '3100': 'Medium', '3477': 'Medium',
    '3479': 'Medium', '3719': 'Medium'
};

async function fetchLatestProblems() {
    try {
        const response = await fetch(GITHUB_COMMITS_API + '?per_page=10');
        const commits = await response.json();
        
        const recentProblems = [];
        const seenProblems = new Set();
        
        for (const commit of commits) {
            const message = commit.commit.message;
            // Extract problem number and name from commit message
            const match = message.match(/(\d{4})-(.+)/);
            if (match && !seenProblems.has(match[1])) {
                const problemNumber = match[1];
                const problemName = match[2].split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                const difficulty = difficultyMap[problemNumber] || 'Medium';
                const date = new Date(commit.commit.author.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                recentProblems.push({
                    number: problemNumber,
                    name: problemName,
                    difficulty: difficulty,
                    date: date,
                    url: `https://github.com/onazor/LeetCode/tree/main/${match[0]}`
                });
                
                seenProblems.add(problemNumber);
                
                if (recentProblems.length === 3) break;
            }
        }
        
        return recentProblems;
    } catch (error) {
        console.error('Error fetching latest problems:', error);
        return [];
    }
}

async function fetchLeetCodeData() {
    try {
        const response = await fetch(GITHUB_API);
        const data = await response.json();
        
        // Filter only directories (problems)
        const problems = data.filter(item => item.type === 'dir');
        
        // Parse and categorize problems
        const stats = { easy: 0, medium: 0, hard: 0, total: problems.length };
        const problemList = [];
        
        problems.forEach(problem => {
            const problemNumber = problem.name.split('-')[0];
            const difficulty = difficultyMap[problemNumber] || 'Medium';
            const problemName = problem.name.substring(5).split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            // Update stats
            stats[difficulty.toLowerCase()]++;
            
            problemList.push({
                number: problemNumber,
                name: problemName,
                difficulty: difficulty,
                url: problem.html_url
            });
        });
        
        // Sort by problem number
        problemList.sort((a, b) => parseInt(a.number) - parseInt(b.number));
        
        return { stats, problemList };
    } catch (error) {
        console.error('Error fetching LeetCode data:', error);
        return null;
    }
}

// Update the page with fetched data
async function updatePage() {
    const data = await fetchLeetCodeData();
    if (!data) return;
    
    // Update stats
    document.getElementById('total-solved').textContent = data.stats.total;
    document.getElementById('easy-solved').textContent = data.stats.easy;
    document.getElementById('medium-solved').textContent = data.stats.medium;
    document.getElementById('hard-solved').textContent = data.stats.hard;
    
    // Update recent problems
    const recentProblems = await fetchLatestProblems();
    const recentListElement = document.getElementById('recent-problems');
    if (recentProblems.length > 0) {
        recentListElement.innerHTML = '';
        recentProblems.forEach(problem => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="date">${problem.date}</span>
                <a href="${problem.url}" target="_blank">${problem.number}. ${problem.name} <span style="color: #888;">(${problem.difficulty})</span></a>
            `;
            recentListElement.appendChild(li);
        });
    }
}

// Load data when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePage);
} else {
    updatePage();
}

// Auto-refresh every 5 minutes (300000 milliseconds)
setInterval(updatePage, 300000);
