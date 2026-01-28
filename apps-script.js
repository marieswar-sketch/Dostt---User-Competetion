// ============================================
// GOOGLE APPS SCRIPT - Deploy this as a Web App
// ============================================
// Instructions:
// 1. Open https://script.google.com/
// 2. Create a new project
// 3. Paste this code
// 4. Replace SHEET_ID and DOC_ID below
// 5. Deploy as Web App (Execute as: Me, Access: Anyone)
// 6. Copy the Web App URL to your website's script.js

const SHEET_ID = '1DExwWv7CHrt-aC3V33KOa00Xze7ss8e_7fbJ9a7MNto';
const DOC_ID = '1Vcs3p9rSZ9t02az27uAnic0XbspmbjX2RvJPEsDrJTI';

// GET endpoint - returns the matching leaderboard row
function doGet(e) {
    const action = e.parameter.action;

    // Handle T&C request
    if (action === 'terms') {
        return getTermsAndConditions();
    }

    // Handle logging request (to bypass CORS issues with POST)
    if (action === 'log') {
        return handleGetLog(e.parameter);
    }

    // Handle leaderboard lookup
    const mobile = e.parameter.mobile;
    if (!mobile) {
        return jsonResponse({ error: 'Mobile number required' });
    }

    return getLeaderboardData(mobile);
}

function handleGetLog(params) {
    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        let logs = ss.getSheetByName('Users Logs');

        // Create the sheet if it doesn't exist
        if (!logs) {
            logs = ss.insertSheet('Users Logs');
            logs.appendRow(['Timestamp', 'Mobile number', 'Coins utilized they see', 'Rank they see']);
        }

        const timestamp = params.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const mobile = params.mobile || "Unknown";
        const coins = params.coinsUtilized || "0";
        const rank = params.rank || "N/A";

        logs.appendRow([timestamp, mobile, coins, rank]);

        return jsonResponse({ success: true, message: "Log added" });
    } catch (err) {
        return jsonResponse({ error: err.toString() });
    }
}

// POST endpoint - appends a log entry
function doPost(e) {
    try {
        const payload = JSON.parse(e.postData.contents);
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const logs = ss.getSheetByName('Users Logs');

        if (!logs) {
            return jsonResponse({ error: 'Users Logs sheet not found' });
        }

        logs.appendRow([
            payload.timestamp,
            payload.mobile,
            payload.coinsUtilized,
            payload.rank
        ]);

        return jsonResponse({ success: true });
    } catch (err) {
        return jsonResponse({ error: err.toString() });
    }
}

function getLeaderboardData(mobile) {
    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const leaderboard = ss.getSheetByName('Leaderboard');

        if (!leaderboard) {
            return jsonResponse({ error: 'Leaderboard sheet not found' });
        }

        const data = leaderboard.getDataRange().getValues();
        const headers = data[0];
        const rows = data.slice(1);

        const mobileColIndex = headers.findIndex(h => h.toString().toLowerCase().replace(/\s+/g, '') === 'mobileno');
        const rankColIndex = headers.findIndex(h => h.toString().toLowerCase().includes('rank'));
        const coinsColIndex = headers.findIndex(h => h.toString().toLowerCase().includes('utilised') || h.toString().toLowerCase().includes('utilized'));

        if (mobileColIndex === -1) return jsonResponse({ error: 'mobile no column not found' });

        const searchMobile = mobile.replace(/^\+91/, '').replace(/^91/, '').trim();
        const matchingRow = rows.find(r => {
            const cellValue = String(r[mobileColIndex]).trim();
            const normalizedCell = cellValue.replace(/^\+91/, '').replace(/^91/, '');
            return normalizedCell === searchMobile;
        });

        // Find Rank 1 coins
        let rank1Coins = 0;
        const rank1Row = rows.find(r => Number(r[rankColIndex]) === 1);
        if (rank1Row && coinsColIndex !== -1) {
            rank1Coins = Number(rank1Row[coinsColIndex]);
        }

        if (!matchingRow) {
            return jsonResponse({ rank1Coins: rank1Coins });
        }

        const result = {};
        headers.forEach((header, index) => {
            result[header] = matchingRow[index];
        });
        result['rank1Coins'] = rank1Coins;

        return jsonResponse(result);
    } catch (err) {
        return jsonResponse({ error: err.toString() });
    }
}

function getTermsAndConditions() {
    try {
        const doc = DocumentApp.openById(DOC_ID);
        const body = doc.getBody();
        const text = body.getText();

        return jsonResponse({
            terms: text,
            lastUpdated: new Date().toISOString()
        });
    } catch (err) {
        // Fallback if doc is not accessible
        return jsonResponse({
            terms: `Terms & Conditions

Campaign Period: 29 Jan – 1 Feb 2026

1. Eligibility
   - This campaign is open to all registered Dostt users.
   - Participants must have a valid mobile number registered with Dostt.

2. Ranking Criteria
   - Rankings are based on total coins spent (ltv) during the campaign period.
   - The leaderboard is updated in real-time.

3. Prizes
   - Rank #1: Apple AirPods 4
   - Dostt reserves the right to modify prizes at any time.

4. General Terms
   - Dostt reserves the right to modify rules or prizes without prior notice.
   - The final decision on all matters rests with the Dostt team.
   - By participating, you agree to these terms and conditions.

For questions, contact: support@dostt.com`,
            lastUpdated: new Date().toISOString()
        });
    }
}

function jsonResponse(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}
