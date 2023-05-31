import { getUser } from "~/session.server";

const superAdminEmails = [
    "scott@scottplusplus.com"
];

export async function userIsSuperAdmin(request: Request):Promise<boolean> {

    const user = await getUser(request);
    if (user == null){
        return false;
    }
    return superAdminEmails.includes(user.email);
}