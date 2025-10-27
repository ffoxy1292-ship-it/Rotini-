class VoteSystem {
    constructor() {
        this.votes = JSON.parse(localStorage.getItem('weekly_votes')) || {};
        this.weekKey = this.getWeekKey();
        this.init();
    }

    getWeekKey() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - startOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + 1) / 7);
    }

    init() {
        this.displayCandidates();
        this.checkAndResetWeeklyVotes();
    }

    addCandidate(userId, userName, postContent) {
        if (!this.votes[this.weekKey]) {
            this.votes[this.weekKey] = {};
        }
        
        if (!this.votes[this.weekKey][userId]) {
            this.votes[this.weekKey][userId] = {
                name: userName,
                content: postContent,
                votes: 0,
                stars: 0
            };
            this.saveVotes();
        }
    }

    voteForCandidate(userId) {
        if (this.votes[this.weekKey] && this.votes[this.weekKey][userId]) {
            this.votes[this.weekKey][userId].votes++;
            this.saveVotes();
            this.displayCandidates();
        }
    }

    getWeeklyWinner() {
        if (!this.votes[this.weekKey]) return null;
        
        const candidates = Object.values(this.votes[this.weekKey]);
        if (candidates.length === 0) return null;
        
        return candidates.reduce((prev, current) => 
            (prev.votes > current.votes) ? prev : current
        );
    }

    displayCandidates() {
        const container = document.getElementById('vote-candidates');
        if (!this.votes[this.weekKey]) {
            container.innerHTML = '<p>لا يوجد مرشحين لهذا الأسبوع بعد</p>';
            return;
        }

        let html = '';
        Object.entries(this.votes[this.weekKey]).forEach(([userId, candidate]) => {
            html += `
                <div class="candidate">
                    <h4>${candidate.name} ${candidate.stars > 0 ? '⭐'.repeat(candidate.stars) : ''}</h4>
                    <p>${candidate.content.substring(0, 100)}...</p>
                    <p>الأصوات: ${candidate.votes}</p>
                    <button onclick="voteSystem.voteForCandidate('${userId}')" class="cute-button">
                        التصويت ✨
                    </button>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    checkAndResetWeeklyVotes() {
        // التحقق إذا انتقلنا لأسبوع جديد
        if (this.votes.lastWeek && this.votes.lastWeek !== this.weekKey) {
            const winner = this.getWeeklyWinner();
            if (winner) {
                winner.stars = (winner.stars || 0) + 1;
                alert(`مبروك! ${winner.name} فازت بلقب نجمة الأسبوع! ⭐`);
            }
        }
        this.votes.lastWeek = this.weekKey;
        this.saveVotes();
    }

    saveVotes() {
        localStorage.setItem('weekly_votes', JSON.stringify(this.votes));
    }
              }
