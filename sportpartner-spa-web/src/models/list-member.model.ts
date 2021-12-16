import { MemberModel } from './member.model';

export class ListMemberModel {
    blocker: string;
    lastSeen: string;
    members: Array<MemberModel>;
}
