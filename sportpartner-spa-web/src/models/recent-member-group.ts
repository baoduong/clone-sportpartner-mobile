import { MemberModel } from './member.model';

export class RecentMemberGroupModel {
    groupId: number;
    publicId: string;
    sportName: string;
    cityName: string;
    groupName: string;
    url: string;
    urlPathSport: string;
    urlPathCity: string;
    totalNewMembers: number;
    recentMembers: Array<MemberModel>;
}
