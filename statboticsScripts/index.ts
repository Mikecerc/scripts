import fetch from 'node-fetch';
const env = Bun.file(".env");
const text = env.text();

const events = ["2023mimil", "2022mimil"]; //example

class TBA {
    base: string;
    header: string;
    constructor(auth_key: string | undefined) {
        this.header = "?X-TBA-Auth-Key=" + auth_key;
        this.base = "https://www.thebluealliance.com/api/v3/";
    }
    public async getEventTeams(eventKey: string): Promise<[ITeam]> {
        const res = await fetch(this.base + "event/" + eventKey + "/teams" + this.header);
        if (res.status != 200) {
            console.log(res.status + ": " + res.statusText);
            throw new Error("Failed to fetch event teams");
        }
        if (res.status == 200) {
            return res.json() as Promise<[ITeam]>;
        }
        throw new Error("Failed to fetch event teams");
    }
}

interface ITeam {
    address: string;
    city: string;
    country: string;
    gmaps_place_id: string;
    gmaps_url: string;
    key: string;
    lat: string | number;
    lng: string | number;
    location_name: string;
    motto: string;
    name: string;
    nickname: string;
    postal_code: string;
    rookie_year: number;
    school_name: string;
    state_prov: string;
    team_number: number;
    website: string;
}
interface IEPA {
    team: number;
    name: string;
    offseason: false;
    state: string;
    country: string;
    district: string;
    rookie_year: number;
    active: boolean;
    norm_epa: number;
    norm_epa_recent: number;
    norm_epa_mean: number;
    norm_epa_max: number;
    wins: number;
    losses: number;
    ties: number;
    count: number;
    winrate: number;
    full_wins: number;
    full_losses: number;
    full_ties: number;
    full_count: number;
    full_winrate: number;
}

const tba = new TBA((await text).slice(8, 100));
const avgEPAPerEvent = await Promise.allSettled(
    events.map(async (event) => {
        const res: [ITeam] = await tba.getEventTeams(event);
        const epas = await Promise.allSettled(
            res.map(async (team) => {
                const req = await callStatbotics(team.team_number);
                return req.norm_epa;
            })
        );
        const sum = epas.reduce((a, b) => a + (b.status === 'fulfilled' ? b.value : 0), 0);
        const average = sum / epas.length;
        return average;
    })
);
const sum = avgEPAPerEvent.reduce((a, b) => a + (b.status === 'fulfilled' ? b.value : 0), 0);
const average = sum / avgEPAPerEvent.length;
console.log("Average EPA Event: " + average);


async function callStatbotics(team: number): Promise<IEPA> {
    const res = await fetch("https://api.statbotics.io/v2/team/" + team)
    const json = await res.json();
    return json as Promise<IEPA>;
}