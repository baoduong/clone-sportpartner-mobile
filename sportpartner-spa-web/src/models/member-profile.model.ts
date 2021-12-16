export class MemberProfileModel {
  id: number;
  screenName: string;
  // avatar: string;
  avatarUrl: string;
  conversation: {
    conversationId: string,
    isBlocked: boolean,
    isDeleted: boolean,
    isHighFive: boolean,
    isRequestedPhoto: boolean,
    isSentFirstMessage: boolean,
    isStarred: boolean
  };
  isDeletedUser: boolean;
  address: string;
  age: number;
  gender: string;
  introduction: string;
  isPremium: boolean;
  isFavorite: boolean;
  // isFavorited: boolean;
  // isHighfived: boolean;
  // isRequestedPhoto: boolean;
  // isSentFirstMessage: boolean;
  sports: Array<any>;
  country: number;
  culture: string;
  countryCode: string;
  languageCode: string;
  language: number;
  memberType: string;
  publicId: string;
  offerOverlay: {
    type: string,
    timestmap: string,
    offerOverlayDataDto: {
      currency: string,
      priceDefault: number,
      priceDiscount: number,
      total: number,
    }
  };
}
