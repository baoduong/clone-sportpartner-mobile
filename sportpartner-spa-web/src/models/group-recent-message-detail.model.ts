export class GroupRecentMessageDetail {
    conversationId: string;
    conversationType: string;
    referenceId: number;
    senderId: number;
    receiverIds: number;
    senderGuid: string;
    senderName: string;
    senderPhoto: string;
    messageBody: string;
    messageType: string;
    sentOnTime: number;
    sentOnDate: string;
    sentOnDateType: string;
    source: string;
    tick: string;
    countryId: number;
    isSenderWasDeleted: boolean;

    groupName: string;
    urlPathSport: string;
    urlPathCity: string;
    screenName: string;
    userPublicId: string;
    avatar: string;
    sentOn: string;
    sentOnType: string;
    unreadCount: number;

    constructor(avatar, screenName, sentOnType, sentOn, userPublicId) {
        this.senderPhoto = avatar;
        this.senderName = screenName;
        this.sentOnDateType = sentOnType;
        this.sentOnDate = sentOn;
        this.senderGuid = userPublicId;
    }
}
