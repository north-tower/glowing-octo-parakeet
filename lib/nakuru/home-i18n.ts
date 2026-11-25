import type { LandingLang } from "@/lib/nakuru/i18n";
import type { CategoryId } from "@/lib/nakuru/types";

export type HomeCopyKey =
  | "deliverTo"
  | "zoneSheetTitle"
  | "zoneWaitlistHint"
  | "searchPlaceholder"
  | "searchSubmit"
  | "searchPhoto"
  | "searchAsk"
  | "assistantPromptRow"
  | "assistantPromptRowSub"
  | "skipToContent"
  | "homePageTitle"
  | "trustVerifiedTitle"
  | "trustVerifiedSub"
  | "trustVerifiedLink"
  | "trustPayTitle"
  | "trustPaySub"
  | "trustPayLink"
  | "qaCategories"
  | "qaQuote"
  | "qaSell"
  | "qaGuide"
  | "userGuideTitle"
  | "userGuideDismiss"
  | "userGuideStep1Title"
  | "userGuideStep1Body"
  | "userGuideStep2Title"
  | "userGuideStep2Body"
  | "userGuideStep3Title"
  | "userGuideStep3Body"
  | "userGuideStep4Title"
  | "userGuideStep4Body"
  | "slide0Title"
  | "slide0Sub"
  | "slide1Title"
  | "slide1Sub"
  | "slide2Title"
  | "slide2Sub"
  | "soon"
  | "topRankings"
  | "topRankingsSub"
  | "topCategories"
  | "pickedForYou"
  | "freshInZone"
  | "railEmpty"
  | "verifiedSellers"
  | "pickedFilterAll"
  | "pickedFilterVerified"
  | "pickedSortNewest"
  | "pickedSortPriceLow"
  | "pickedSortPriceHigh"
  | "pickedResultCount"
  | "pickedLoadMore"
  | "pickedEmpty"
  | "listingsEmptyTitle"
  | "listingsEmptyBody"
  | "listingsEmptySearchTitle"
  | "listingsEmptySearchBody"
  | "listingsEmptyFilterTitle"
  | "listingsEmptyFilterBody"
  | "listingsEmptyBrowse"
  | "pickedFiltersAria"
  | "photoCountPill"
  | "addToCartAria"
  | "slide0Cta"
  | "slide1Cta"
  | "slide2Cta"
  | "heroVendorCta"
  | "heroVendorFeatured"
  | "heroVendorVerified"
  | "seeAll"
  | "verifiedPill"
  | "payOnDelivery"
  | "addedToCart"
  | "addToCart"
  | "navHome"
  | "navCategory"
  | "navMessage"
  | "navCart"
  | "navAccount"
  | "vendorCardTitle"
  | "vendorCardSub"
  | "vendorCardCta"
  | "vendorCardDismissAria"
  | "popularRightNow"
  | "browseByType"
  | "browseByTypeHint"
  | "categoryBreadcrumb"
  | "categoryDrillHint"
  | "categoryHubNav"
  | "categorySearchPlaceholder"
  | "categoryAllSections"
  | "hubGroupMotors"
  | "hubGroupProperty"
  | "hubGroupShopping"
  | "hubGroupServices"
  | "hubGroupWork"
  | "moreComingSoon"
  | "categoryRailAria"
  | "catGroupShopDesc"
  | "catGroupPropertyDesc"
  | "catGroupCarsDesc"
  | "catGroupServicesDesc"
  | "catGroupStaysDesc"
  | "catGroupTaxiDesc"
  | "catGroupRiderDesc"
  | "allShop"
  | "allProperty"
  | "allCars"
  | "allServices"
  | "allStays"
  | "allTaxi"
  | "allRiders"
  | "listings"
  | "sideFeatured"
  | "productBack"
  | "productAbout"
  | "productNotFoundTitle"
  | "productNotFoundBody"
  | "productBrowse"
  | "productShare"
  | "productShareCopied"
  | "productShareAria"
  | "productBackAria"
  | "productGalleryCount"
  | "productPayCodDetail"
  | "productPayMpesaDetail"
  | "productDeliveringTo"
  | "productDeliveryFeeHint"
  | "productTrustUnverified"
  | "productTrustUnverifiedTitle"
  | "productTrustUnverifiedBody"
  | "productMessageSeller"
  | "productReadMore"
  | "productReadLess"
  | "productGoToCart"
  | "productRequestViewing"
  | "productRequestQuote"
  | "productOutsideZone"
  | "productMoreFromSeller"
  | "productSimilar"
  | "productViewingPrefill"
  | "productViewingOnSiteHint"
  | "productAttrBedrooms"
  | "productAttrMileage"
  | "productAttrYear"
  | "productAttrArea"
  | "productAttrLocation"
  | "productAttrTenure"
  | "productAttrPlotSize"
  | "productAttrBathrooms"
  | "productAttrHours"
  | "productAttrServiceArea"
  | "productAttrWalkIn"
  | "productAttrTransmission"
  | "productAttrCondition"
  | "productAttrPosted"
  | "productAttrCategory"
  | "productSellerTitle"
  | "productNotVerifiedPill"
  | "productVerifiedMeaningTitle"
  | "productVerifiedMeaningBody"
  | "productUnverifiedMeaningBody"
  | "productWhatVerifiedMeans"
  | "productViewSellerListings"
  | "productSafetyTitle"
  | "productSafetyMeet"
  | "productSafetyPay"
  | "productReport"
  | "productNoReviews"
  | "productCall"
  | "productServiceAreaTitle"
  | "productWalkInTitle"
  | "productLightboxClose"
  | "productSimilarIn"
  | "productSaveAria"
  | "productUnsaveAria"
  | "productPricePerMonth"
  | "productPriceForSale"
  | "inquiryViewingTitle"
  | "inquiryQuoteTitle"
  | "inquiryViewingSent"
  | "inquiryQuoteSent"
  | "inquiryViewingPlaceholder"
  | "inquiryQuotePlaceholder"
  | "inquiryViewingSubmit"
  | "inquiryQuoteSubmit"
  | "productDetails"
  | "cartSegmentCart"
  | "cartSegmentOrders"
  | "cartEmptyTitle"
  | "cartEmptyBody"
  | "cartStartShopping"
  | "cartOrdersEmptyTitle"
  | "cartOrdersEmptyBody"
  | "cartSectionItems"
  | "cartSectionDelivery"
  | "cartSectionPayment"
  | "cartSectionSummary"
  | "cartSignInPlace"
  | "cartSignIn"
  | "cartFirstOrderNote"
  | "cartFirstOrderChip"
  | "cartDeliveryFree"
  | "cartSavedOnDevice"
  | "cartClearSaved"
  | "cartPlaceOrder"
  | "cartPlacing"
  | "cartUndo"
  | "cartRemoved"
  | "cartAddressError"
  | "cartPhoneError"
  | "cartPayMpesaTitle"
  | "cartPayMpesaLocked"
  | "cartPayMpesaSoon"
  | "cartPayMpesaOk"
  | "cartOutsideZone"
  | "cartListingGone"
  | "cartRemoveListing"
  | "cartTrackOrder"
  | "cartDeliveryCodeHint"
  | "cartDemoNextStatus"
  | "cartCompletedRate"
  | "cartLiveTrackHint"
  | "cartSubtotal"
  | "cartDeliveryLine"
  | "cartTotal"
  | "cartAddressLabel"
  | "cartAddressPlaceholder"
  | "cartPhoneLabel"
  | "cartPhonePlaceholder"
  | "cartPhoneHelper"
  | "orderGroupActive"
  | "orderGroupPast"
  | "orderStatusPlaced"
  | "orderStatusAccepted"
  | "orderStatusOut"
  | "orderStatusDelivered"
  | "orderStatusCancelled"
  | "orderTrackStepPlaced"
  | "orderTrackStepAccepted"
  | "orderTrackStepOut"
  | "orderTrackStepDelivered"
  | "orderDeliveryCodeLabel"
  | "orderDeliveryCodeRider"
  | "orderCopyId"
  | "orderCopyCode"
  | "orderIdCopied"
  | "orderCodeCopied"
  | "orderDemoTracking"
  | "orderMessageSeller"
  | "orderPlacedTitle"
  | "orderContinueShopping"
  | "orderFirstFreeDelivery"
  | "orderTrackBack"
  | "orderItemsUnknown"
  | "orderItemsMore"
  | "accRoleBuyer"
  | "accRoleVendor"
  | "accModeShopping"
  | "accModeSelling"
  | "accModeAria"
  | "accStatusPending"
  | "accStatusUnverified"
  | "accSectionSelling"
  | "accSectionShopping"
  | "accSectionApp"
  | "accMyShop"
  | "accOrdersBuyer"
  | "accSaved"
  | "accHelp"
  | "accApplicationStatus"
  | "accApplyAgain"
  | "accSell"
  | "accMyOrders"
  | "accShopAfterApproval"
  | "accGetVerifiedTitle"
  | "accGetVerifiedSub"
  | "accVerifyStepId"
  | "accVerifyStepShop"
  | "accContactSupport"
  | "accInstallSub"
  | "accLanguage"
  | "accLanguageEn"
  | "accLanguageSw"
  | "accLanguageSheetTitle"
  | "accSignOut"
  | "accSignOutConfirmTitle"
  | "accSignOutConfirm"
  | "accSignOutCancel"
  | "accFooter"
  | "assistantTitle"
  | "assistantDemoChip"
  | "assistantClear"
  | "assistantMenuAria"
  | "assistantEmptyGreeting"
  | "assistantPlaceholder"
  | "assistantSend"
  | "assistantStop"
  | "assistantRetry"
  | "assistantOffline"
  | "assistantEntryHeader"
  | "assistantEntryProduct"
  | "assistantEntryCartPay"
  | "assistantEntrySearch"
  | "assistantEntryAccount"
  | "assistantEntryHelp"
  | "assistantFabLabel"
  | "assistantFabAria"
  | "assistantCloseAria"
  | "accSignedOut"
  | "signInGuestBrowse"
  | "signInGuestNote"
  | "signInRemember"
  | "signInTitle"
  | "signInLead"
  | "signInHelper"
  | "signInEmailLabel"
  | "signInEmailError"
  | "signInSending"
  | "signInCta"
  | "signInCodeTitle"
  | "signInCodeSent"
  | "signInChangeEmail"
  | "signInExpiry"
  | "signInResend"
  | "signInResendIn"
  | "signInWrongCode"
  | "signInExpired"
  | "signInRateLimit"
  | "signInVerifying"
  | "signInVerifyCta"
  | "signInSuccess"
  | "signInContextOrders"
  | "signInContextSaved"
  | "signInTermsBefore"
  | "signInTerms"
  | "signInPrivacy"
  | "signInPhoneSoon"
  | "accAddresses"
  | "accSellPromoSub"
  | "vendorApplySameAccount"
  | "accUploadPhotoAria"
  | "accDefaultName"
  | "discoverEyebrow"
  | "discoverTitle"
  | "discoverSub"
  | "clearFilters"
  | "priceFrom"
  | "chipQuote"
  | "chipViewing"
  | "chipCod"
  | "chipFreeDelivery"
  | "browseCategories"
  | "freshInZoneSeeAll"
  | "servicesNearYou"
  | "propertyAndCars"
  | "moreToExplore"
  | "filterBarSort"
  | "filterBarFilter"
  | "filterSheetTitle"
  | "sortSheetTitle"
  | "sortNearest"
  | "filterPriceRange"
  | "filterPriceMin"
  | "filterPriceMax"
  | "filterZone"
  | "filterListingType"
  | "filterCategory"
  | "filterTypeAll"
  | "filterTypeShop"
  | "filterTypeServices"
  | "filterTypeProperty"
  | "filterTypeCars"
  | "filterApply"
  | "filterVerifiedOnly"
  | "trustStripVerified"
  | "trustStripPay"
  | "trustStripFreeJoin"
  | "trustVerifyTitle"
  | "trustVerifyBody"
  | "trustPayBody"
  | "photoSearchSoon"
  | "resultCountLive"
  | "loadMoreFallback"
  | "featuredFirst"
  | "viewDetails"
  | "saveListingAria"
  | "waSeller"
  | "waSellerMissing"
  | "commentsTitle"
  | "commentsEmpty"
  | "commentsPlaceholder"
  | "commentsSubmit"
  | "commentsSignIn"
  | "commentsDelete"
  | "commentsLoading"
  | "commentsPostError"
  | "commentsLoadError"
  | "commentsForbidden"
  | "commentsRateLimited"
  | "commentsNotFound"
  | "messagesTitle"
  | "messagesHint"
  | "messagesPlaceholder"
  | "messagesSend"
  | "messagesSignIn"
  | "messagesEmpty"
  | "messagesSent"
  | "messagesOpenInbox"
  | "messagesPostError"
  | "messagesLoadError"
  | "messagesForbidden"
  | "messagesRateLimited"
  | "messagesNotFound"
  | "messagesOwnProduct"
  | "navExplore"
  | "navHow"
  | "navSaved"
  | "postListing"
  | "heroSidePostTitle"
  | "heroSidePostCopy"
  | "heroSidePostLink"
  | "heroSidePayTitle"
  | "heroSidePayCopy"
  | "heroSidePayLink"
  | "askChipPhones"
  | "askChipPlumber"
  | "askChipRent"
  | "askChipVerified"
  | "allCategoriesTile"
  | "footerAbout"
  | "footerHow"
  | "footerVerified"
  | "footerSell"
  | "footerHelp"
  | "footerTerms"
  | "footerPrivacy"
  | "footerWhatsapp"
  | "footerPlace"
  | "trustStripVerifiedSub"
  | "trustStripPaySub"
  | "trustStripFreeSub";

export type TopCategorySlug =
  | "phone"
  | "tv"
  | "kitchen"
  | "dress"
  | "sneaker"
  | "veg"
  | "watch"
  | "rent"
  | "sale"
  | "plot"
  | "toyota"
  | "subaru"
  | "electric"
  | "clean"
  | "bnb"
  | "hotel"
  | "short"
  | "airport"
  | "town"
  | "boda"
  | "delivery"
  | "courier";

const COPY: Record<HomeCopyKey, Record<LandingLang, string>> = {
  deliverTo: { en: "Deliver to", sw: "Tuma kwa" },
  zoneSheetTitle: { en: "Delivery area", sw: "Eneo la usafirishaji" },
  zoneWaitlistHint: {
    en: "Outside Nakuru — join the waitlist",
    sw: "Nje ya Nakuru — jiunge na orodha ya kusubiri",
  },
  searchPlaceholder: {
    en: "Search Nakuru",
    sw: "Tafuta Nakuru",
  },
  searchSubmit: { en: "Search", sw: "Tafuta" },
  searchPhoto: { en: "Search by photo", sw: "Tafuta kwa picha" },
  searchAsk: { en: "Ask", sw: "Uliza" },
  assistantPromptRow: {
    en: "Ask the assistant",
    sw: "Uliza msaidizi",
  },
  assistantPromptRowSub: {
    en: "Find phones, trades, and rentals in Nakuru",
    sw: "Tafuta simu, fundi, na nyumba Nakuru",
  },
  photoSearchSoon: {
    en: "Photo search coming soon",
    sw: "Utafutaji kwa picha unakuja hivi karibuni",
  },
  skipToContent: { en: "Skip to content", sw: "Ruka hadi maudhui" },
  homePageTitle: {
    en: "NakuruHub marketplace home",
    sw: "Nyumbani — soko la NakuruHub",
  },
  trustVerifiedTitle: { en: "Verified vendors", sw: "Wauzaji waliothibitishwa" },
  trustVerifiedSub: {
    en: "Every seller ID-checked, so you buy with confidence.",
    sw: "Kila muuzaji amekaguliwa kwa kitambulisho, ununue kwa ujasiri.",
  },
  trustVerifiedLink: { en: "How we verify", sw: "Jinsi tunavyothibitisha" },
  trustPayTitle: { en: "Pay on delivery", sw: "Lipa ukifika" },
  trustPaySub: {
    en: "Inspect your item first, then pay by M-Pesa or cash.",
    sw: "Kagua bidhaa kwanza, kisha lipa kwa M-Pesa au taslimu.",
  },
  trustPayLink: { en: "See how it works", sw: "Angalia jinsi inavyofanya" },
  qaCategories: { en: "Categories", sw: "Kategoria" },
  qaQuote: { en: "Request a quote", sw: "Omba bei" },
  qaSell: { en: "Sell with us", sw: "Uza nasi" },
  qaGuide: { en: "New user guide", sw: "Mwongozo wa mtumiaji mpya" },
  userGuideTitle: {
    en: "How NakuruHub works",
    sw: "Jinsi NakuruHub inavyofanya kazi",
  },
  userGuideDismiss: { en: "Close", sw: "Funga" },
  userGuideStep1Title: {
    en: "Set your delivery area",
    sw: "Weka eneo la usafirishaji",
  },
  userGuideStep1Body: {
    en: "Tap Deliver to at the top and pick your Nakuru zone.",
    sw: "Gusa Tuma kwa juu na chagua eneo lako la Nakuru.",
  },
  userGuideStep2Title: { en: "Browse and add items", sw: "Vinjari na ongeza bidhaa" },
  userGuideStep2Body: {
    en: "Open a category, tap a listing, then add to cart or send a quote request.",
    sw: "Fungua kategoria, gusa tangazo, kisha ongeza kwenye kikapu au omba bei.",
  },
  userGuideStep3Title: {
    en: "Sign in to check out",
    sw: "Ingia ili kumaliza agizo",
  },
  userGuideStep3Body: {
    en: "We email a one-time code — no password. Your cart and orders stay saved.",
    sw: "Tutakutumia kodi kwa barua pepe — hakuna nenosiri. Kikapu na agizo zinahifadhiwa.",
  },
  userGuideStep4Title: { en: "Pay when it arrives", sw: "Lipa ukifika" },
  userGuideStep4Body: {
    en: "Track your order in Messages. Pay cash or M-Pesa on delivery.",
    sw: "Fuata agizo kwenye Ujumbe. Lipa taslimu au M-Pesa ukifika.",
  },
  slide0Title: {
    en: "Free delivery on your first order",
    sw: "Usafirishaji bure kwa agizo lako la kwanza",
  },
  slide0Sub: {
    en: "Pay on delivery · Nakuru",
    sw: "Lipa ukifika · Nakuru",
  },
  slide1Title: {
    en: "Verified vendors",
    sw: "Wauzaji waliothibitishwa",
  },
  slide1Sub: {
    en: "ID-checked sellers",
    sw: "Wauzaji waliokaguliwa kwa kitambulisho",
  },
  slide2Title: {
    en: "Sell on NakuruHub",
    sw: "Uza kwenye NakuruHub",
  },
  slide2Sub: {
    en: "Free to join and list",
    sw: "Bure kujiunga na kuorodhesha",
  },
  soon: { en: "Soon", sw: "Inakuja" },
  topRankings: { en: "Top rankings", sw: "Orodha bora" },
  topRankingsSub: {
    en: "Make shopping efficient",
    sw: "Fanya ununuzi uwe rahisi",
  },
  topCategories: { en: "Top categories", sw: "Kategoria kuu" },
  pickedForYou: { en: "Picked for you", sw: "Imechaguliwa kwako" },
  freshInZone: { en: "Fresh in {zone}", sw: "Mpya {zone}" },
  railEmpty: {
    en: "Nothing here yet. Check back soon.",
    sw: "Bado hakuna. Rudi baadaye.",
  },
  verifiedSellers: { en: "Verified sellers", sw: "Wauzaji waliothibitishwa" },
  pickedFilterAll: { en: "All", sw: "Zote" },
  pickedFilterVerified: { en: "Verified only", sw: "Verified tu" },
  pickedSortNewest: { en: "Newest", sw: "Mpya zaidi" },
  pickedSortPriceLow: { en: "Price low to high", sw: "Bei chini hadi juu" },
  pickedSortPriceHigh: { en: "Price high to low", sw: "Bei juu hadi chini" },
  pickedResultCount: { en: "{n} results", sw: "Matokeo {n}" },
  pickedLoadMore: { en: "Load more", sw: "Pakia zaidi" },
  pickedEmpty: {
    en: "No listings match these filters.",
    sw: "Hakuna matangazo yanayolingana.",
  },
  listingsEmptyTitle: {
    en: "Nothing here yet",
    sw: "Bado hakuna kitu hapa",
  },
  listingsEmptyBody: {
    en: "Approved vendors are adding products — check back soon.",
    sw: "Wauzaji waliothibitishwa wanaongeza bidhaa — rudi hivi karibuni.",
  },
  listingsEmptySearchTitle: {
    en: "No results found",
    sw: "Hakuna matokeo",
  },
  listingsEmptySearchBody: {
    en: "Try a different search or browse categories.",
    sw: "Jaribu utafutaji mwingine au angalia kategoria.",
  },
  listingsEmptyFilterTitle: {
    en: "No listings here",
    sw: "Hakuna matangazo hapa",
  },
  listingsEmptyFilterBody: {
    en: "Nothing in this category yet. Clear filters or try another section.",
    sw: "Bado hakuna katika kategoria hii. Futa vichujio au jaribu sehemu nyingine.",
  },
  listingsEmptyBrowse: {
    en: "Browse categories",
    sw: "Angalia kategoria",
  },
  pickedFiltersAria: {
    en: "Filter and sort listings",
    sw: "Chuja na panga orodha",
  },
  photoCountPill: { en: "{i}/{n}", sw: "{i}/{n}" },
  addToCartAria: {
    en: "Add {name} to cart",
    sw: "Ongeza {name} kwenye kikapu",
  },
  slide0Cta: { en: "Shop now", sw: "Nunua sasa" },
  slide1Cta: { en: "How we verify", sw: "Jinsi tunavyothibitisha" },
  slide2Cta: { en: "Start selling", sw: "Anza kuuza" },
  heroVendorCta: { en: "Visit shop", sw: "Tembelea duka" },
  heroVendorFeatured: { en: "Featured in Nakuru", sw: "Maalum Nakuru" },
  heroVendorVerified: { en: "Verified", sw: "Thibitishwa" },
  seeAll: { en: "See all", sw: "Angalia zote" },
  verifiedPill: { en: "Verified", sw: "Thibitishwa" },
  payOnDelivery: { en: "Pay on delivery", sw: "Lipa ukifika" },
  addedToCart: { en: "Added", sw: "Imeongezwa" },
  addToCart: { en: "Add to cart", sw: "Ongeza kwenye kikapu" },
  navHome: { en: "Home", sw: "Nyumbani" },
  navCategory: { en: "Category", sw: "Kategoria" },
  navMessage: { en: "Message", sw: "Ujumbe" },
  navCart: { en: "Cart", sw: "Kikapu" },
  navAccount: { en: "Account", sw: "Akaunti" },
  vendorCardTitle: { en: "Sell on NakuruHub", sw: "Uza kwenye NakuruHub" },
  vendorCardSub: { en: "Free to join and list.", sw: "Bure kujiunga na kuorodhesha." },
  vendorCardCta: { en: "Start selling", sw: "Anza kuuza" },
  vendorCardDismissAria: {
    en: "Dismiss seller invite",
    sw: "Funga mwaliko wa kuuza",
  },
  popularRightNow: { en: "Popular right now", sw: "Maarufu sasa hivi" },
  browseByType: { en: "Browse by type", sw: "Vinjari kwa aina" },
  browseByTypeHint: {
    en: "All marketplace sections — tap a section, then pick a subcategory.",
    sw: "Sehemu zote za soko — gusa sehemu, kisha chagua kategoria ndogo.",
  },
  categoryBreadcrumb: {
    en: "Category path",
    sw: "Njia ya kategoria",
  },
  categoryDrillHint: {
    en: "Pick a subcategory or view everything in this section.",
    sw: "Chagua kategoria ndogo au ona yote katika sehemu hii.",
  },
  categoryHubNav: {
    en: "Marketplace sections",
    sw: "Sehemu za soko",
  },
  categorySearchPlaceholder: {
    en: "Search categories…",
    sw: "Tafuta kategoria…",
  },
  categoryAllSections: {
    en: "All categories",
    sw: "Kategoria zote",
  },
  hubGroupMotors: { en: "Motors", sw: "Magari" },
  hubGroupProperty: { en: "Property & stays", sw: "Nyumba na makao" },
  hubGroupShopping: { en: "Shopping", sw: "Ununuzi" },
  hubGroupServices: { en: "Services & transport", sw: "Huduma na usafiri" },
  hubGroupWork: { en: "Jobs & CVs", sw: "Kazi na CV" },
  moreComingSoon: { en: "More coming soon", sw: "Zaidi inakuja" },
  categoryRailAria: { en: "Category groups", sw: "Makundi ya kategoria" },
  catGroupShopDesc: {
    en: "Phones, fashion, groceries and more",
    sw: "Simu, mitindo, vyakula na zaidi",
  },
  catGroupPropertyDesc: {
    en: "Rentals, sales and land in Nakuru",
    sw: "Kukodisha, kuuza na ardhi Nakuru",
  },
  catGroupCarsDesc: {
    en: "Browse verified car listings",
    sw: "Vinjari magari yaliyothibitishwa",
  },
  catGroupServicesDesc: {
    en: "Electricians, cleaners, plumbers and more",
    sw: "Mafundi umeme, usafi, mabomba na zaidi",
  },
  catGroupStaysDesc: {
    en: "BnBs, hotels and short stays in Nakuru",
    sw: "BnB, hoteli na malazi mafupi Nakuru",
  },
  catGroupTaxiDesc: {
    en: "Airport, town rides and boda around Nakuru",
    sw: "Uwanja wa ndege, mjini na boda Nakuru",
  },
  catGroupRiderDesc: {
    en: "Delivery riders, couriers and boda for hire",
    sw: "Waendeshaji, couriers na boda kwa kodi",
  },
  allShop: { en: "All shop", sw: "Duka zote" },
  allProperty: { en: "All property", sw: "Mali zote" },
  allCars: { en: "All cars", sw: "Magari yote" },
  allServices: { en: "All services", sw: "Huduma zote" },
  allStays: { en: "All stays", sw: "Malazi yote" },
  allTaxi: { en: "All taxi", sw: "Teksi zote" },
  allRiders: { en: "All riders", sw: "Waendeshaji wote" },
  listings: { en: "Listings", sw: "Orodha" },
  sideFeatured: { en: "Featured", sw: "Maalum" },
  productBack: { en: "Back to browse", sw: "Rudi vinjarini" },
  productAbout: { en: "About this listing", sw: "Kuhusu tangazo hili" },
  productNotFoundTitle: { en: "Listing not found", sw: "Tangazo halipatikani" },
  productNotFoundBody: {
    en: "It may have sold out or the link is outdated.",
    sw: "Labda limekwisha au kiungo ni cha zamani.",
  },
  productBrowse: { en: "Browse marketplace", sw: "Vinjari soko" },
  productShare: { en: "Share", sw: "Shiriki" },
  productShareCopied: { en: "Link copied", sw: "Kiungo kimenakiliwa" },
  productShareAria: { en: "Share this listing", sw: "Shiriki tangazo hili" },
  productBackAria: { en: "Back to browse", sw: "Rudi vinjarini" },
  productGalleryCount: { en: "Image", sw: "Picha" },
  productPayCodDetail: {
    en: "Pay on delivery — cash or M-Pesa to the rider",
    sw: "Lipa ukifika — pesa taslimu au M-Pesa kwa dereva",
  },
  productPayMpesaDetail: {
    en: "M-Pesa now — available at checkout when all items in your cart are from Verified vendors",
    sw: "M-Pesa sasa — inapatikana malapo wakati bidhaa zote kwenye kikapu ni kutoka kwa wauzaji waliothibitishwa",
  },
  productDeliveringTo: { en: "Delivering to", sw: "Inatumwa kwa" },
  productDeliveryFeeHint: {
    en: "Delivery fee set by zone",
    sw: "Ada ya usafirishaji inategemea eneo",
  },
  productTrustUnverified: {
    en: "Pay on delivery only",
    sw: "Lipa ukifika tu",
  },
  productTrustUnverifiedTitle: {
    en: "Unverified seller",
    sw: "Muuzaji asiyethibitishwa",
  },
  productTrustUnverifiedBody: {
    en: "Pay on delivery — cash or M-Pesa to the rider.",
    sw: "Lipa ukifika — pesa taslimu au M-Pesa kwa dereva.",
  },
  productMessageSeller: { en: "Message seller", sw: "Mtumie muuzaji" },
  productReadMore: { en: "Read more", sw: "Soma zaidi" },
  productReadLess: { en: "Read less", sw: "Soma kidogo" },
  productGoToCart: { en: "Go to cart", sw: "Nenda kikapuni" },
  productRequestViewing: { en: "Request viewing", sw: "Omba kutembelea" },
  productRequestQuote: { en: "Request a quote", sw: "Omba bei" },
  productOutsideZone: {
    en: "Delivery is Nakuru only. Change your area at the top of Home.",
    sw: "Tunapeleka Nakuru tu. Badilisha eneo lako juu ya Nyumbani.",
  },
  productMoreFromSeller: { en: "More from this seller", sw: "Zaidi kutoka kwa muuzaji huyu" },
  productSimilar: { en: "Similar listings", sw: "Matangazo yanayofanana" },
  productViewingPrefill: {
    en: "Open Messages to follow up on your viewing request.",
    sw: "Fungua Ujumbe kuendelea na ombi lako la kutembelea.",
  },
  productViewingOnSiteHint: {
    en: "Inspect on site before you pay or sign. We follow up by message.",
    sw: "Tembelea kwanza kabla ya kulipa. Tutawasiliana kwa ujumbe.",
  },
  productAttrBedrooms: { en: "Bedrooms", sw: "Vyumba" },
  productAttrMileage: { en: "Mileage", sw: "Maili" },
  productAttrYear: { en: "Year", sw: "Mwaka" },
  productAttrArea: { en: "Size", sw: "Ukubwa" },
  productAttrLocation: { en: "Location", sw: "Mahali" },
  productAttrTenure: { en: "Listing type", sw: "Aina ya tangazo" },
  productAttrPlotSize: { en: "Plot size", sw: "Ukubwa wa kiwanja" },
  productAttrBathrooms: { en: "Bathrooms", sw: "Bafu" },
  productAttrHours: { en: "Hours", sw: "Saa" },
  productAttrServiceArea: { en: "Service area", sw: "Eneo la huduma" },
  productAttrWalkIn: { en: "Walk-in address", sw: "Anwani ya ofisi" },
  productAttrTransmission: { en: "Transmission", sw: "Gia" },
  productAttrCondition: { en: "Condition", sw: "Hali" },
  productAttrPosted: { en: "Posted", sw: "Imewekwa" },
  productAttrCategory: { en: "Category", sw: "Kundi" },
  productSellerTitle: { en: "Seller", sw: "Muuzaji" },
  productNotVerifiedPill: { en: "Not yet verified", sw: "Bado haijathibitishwa" },
  productVerifiedMeaningTitle: { en: "What does this mean?", sw: "Hii inamaanisha nini?" },
  productVerifiedMeaningBody: {
    en: "Verified sellers can take M-Pesa upfront. You can pay before delivery with more protection.",
    sw: "Wauzaji waliothibitishwa wanaweza kupokea M-Pesa mapema. Unaweza kulipa kabla ya kuwasilisha.",
  },
  productUnverifiedMeaningBody: {
    en: "This seller is not yet Verified. Pay cash or M-Pesa on delivery — don’t send money in advance.",
    sw: "Muuzaji huyu bado hajathibitishwa. Lipa taslimu au M-Pesa ukifika — usitume pesa mapema.",
  },
  productWhatVerifiedMeans: { en: "What does this mean?", sw: "Hii inamaanisha nini?" },
  productViewSellerListings: {
    en: "View all listings from this seller",
    sw: "Tazama matangazo yote ya muuzaji huyu",
  },
  productSafetyTitle: { en: "Safety tips", sw: "Vidokezo vya usalama" },
  productSafetyMeet: {
    en: "Meet in public places when you inspect an item, home, or car.",
    sw: "Kutane sehemu za umma unapokagua bidhaa, nyumba, au gari.",
  },
  productSafetyPay: {
    en: "Don’t pay in advance unless the seller is Verified.",
    sw: "Usilipe mapema isipokuwa muuzaji ame Verified.",
  },
  productReport: { en: "Report listing", sw: "Ripoti tangazo" },
  productNoReviews: { en: "No reviews yet", sw: "Bado hakuna maoni" },
  productCall: { en: "Call", sw: "Piga" },
  productServiceAreaTitle: { en: "Service area", sw: "Eneo la huduma" },
  productWalkInTitle: { en: "Walk-in address / hours", sw: "Ofisi na saa" },
  productLightboxClose: { en: "Close photos", sw: "Funga picha" },
  productSimilarIn: { en: "Similar in", sw: "Zinazofanana katika" },
  productSaveAria: { en: "Save listing", sw: "Hifadhi tangazo" },
  productUnsaveAria: { en: "Remove from saved", sw: "Ondoa kwenye vilivyohifadhiwa" },
  productPricePerMonth: { en: "/ month", sw: "/ mwezi" },
  productPriceForSale: { en: "for sale", sw: "kwa kuuza" },
  inquiryViewingTitle: { en: "Request a viewing", sw: "Omba kutembelea" },
  inquiryQuoteTitle: { en: "Request a quote", sw: "Omba bei" },
  inquiryViewingSent: {
    en: "Viewing request sent. The agent will follow up by message.",
    sw: "Ombi la kutembelea limetumwa. Wakala atawasiliana nawe.",
  },
  inquiryQuoteSent: {
    en: "Quote request sent to the vendor.",
    sw: "Ombi la bei limetumwa kwa muuzaji.",
  },
  inquiryViewingPlaceholder: {
    en: "Preferred viewing day, questions about the property…",
    sw: "Siku unayopendelea kutembelea, maswali kuhusu mali…",
  },
  inquiryQuotePlaceholder: {
    en: "Describe the job, location, or timing…",
    sw: "Eleza kazi, eneo, au muda…",
  },
  inquiryViewingSubmit: { en: "Send viewing request", sw: "Tuma ombi la kutembelea" },
  inquiryQuoteSubmit: { en: "Send quote request", sw: "Tuma ombi la bei" },
  productDetails: { en: "Listing details", sw: "Maelezo ya tangazo" },
  cartSegmentCart: { en: "Cart", sw: "Kikapu" },
  cartSegmentOrders: { en: "Orders", sw: "Maagizo" },
  cartEmptyTitle: { en: "Your cart is empty", sw: "Kikapu chako ni tupu" },
  cartEmptyBody: {
    en: "Add something from Shop.",
    sw: "Ongeza kitu kutoka Duka.",
  },
  cartStartShopping: { en: "Start shopping", sw: "Anza ununuzi" },
  cartOrdersEmptyTitle: { en: "No orders yet", sw: "Hakuna maagizo bado" },
  cartOrdersEmptyBody: {
    en: "After checkout you will see them here.",
    sw: "Baada ya malipo utayaona hapa.",
  },
  cartSectionItems: { en: "Items", sw: "Bidhaa" },
  cartSectionDelivery: { en: "Delivery details", sw: "Maelezo ya usafirishaji" },
  cartSectionPayment: { en: "Payment", sw: "Malipo" },
  cartSectionSummary: { en: "Summary", sw: "Muhtasari" },
  cartSignInPlace: {
    en: "Sign in to place your order",
    sw: "Ingia ili kuweka agizo lako",
  },
  cartSignIn: { en: "Sign in", sw: "Ingia" },
  cartFirstOrderNote: {
    en: "Free delivery on your first order — sign in to apply",
    sw: "Usafirishaji bure kwa agizo lako la kwanza — ingia ili utumie",
  },
  cartFirstOrderChip: { en: "First order offer", sw: "Ofa ya agizo la kwanza" },
  cartDeliveryFree: { en: "Free", sw: "Bure" },
  cartSavedOnDevice: {
    en: "Saved on this device",
    sw: "Imehifadhiwa kwenye kifaa hiki",
  },
  cartClearSaved: { en: "Clear saved details", sw: "Futa maelezo yaliyohifadhiwa" },
  cartPlaceOrder: { en: "Place order", sw: "Weka agizo" },
  cartPlacing: { en: "Placing order…", sw: "Inaweka agizo…" },
  cartUndo: { en: "Undo", sw: "Tendua" },
  cartRemoved: { en: "Removed from cart", sw: "Imeondolewa kwenye kikapu" },
  cartAddressError: {
    en: "Enter your delivery address (estate, street, landmark).",
    sw: "Andika anwani yako ya usafirishaji (mtaa, barabara, alama).",
  },
  cartPhoneError: {
    en: "Enter a valid Kenyan phone, e.g. 0712 345 678",
    sw: "Andika nambari halali ya Kenya, mf. 0712 345 678",
  },
  cartPayMpesaTitle: { en: "M-Pesa now", sw: "M-Pesa sasa" },
  cartPayMpesaLocked: {
    en: "Available when all items are from Verified vendors",
    sw: "Inapatikana wakati bidhaa zote ni kutoka kwa wauzaji waliothibitishwa",
  },
  cartPayMpesaSoon: { en: "Coming soon", sw: "Inakuja" },
  cartPayMpesaOk: {
    en: "Available: all vendors are verified",
    sw: "Inapatikana: wauzaji wote wamethibitishwa",
  },
  cartOutsideZone: {
    en: "We deliver within Nakuru only. Change your area at the top.",
    sw: "Tunafikisha Nakuru tu. Badilisha eneo lako juu.",
  },
  cartListingGone: {
    en: "This listing is no longer available.",
    sw: "Tangazo hili halipatikani tena.",
  },
  cartRemoveListing: { en: "Remove", sw: "Ondoa" },
  cartTrackOrder: { en: "Track order", sw: "Fuata agizo" },
  cartDeliveryCodeHint: {
    en: "Delivery code (give it to the rider)",
    sw: "Msimbo wa usafirishaji (mpatie dereva)",
  },
  cartDemoNextStatus: { en: "Next status (demo)", sw: "Hatua inayofuata (majira)" },
  cartCompletedRate: {
    en: "Completed. Rate your vendor.",
    sw: "Imekamilika. Kadiria muuzaji wako.",
  },
  cartLiveTrackHint: {
    en: "Track updates here after the vendor accepts your order.",
    sw: "Fuata taarifa hapa baada ya muuzaji kukubali agizo lako.",
  },
  cartSubtotal: { en: "Subtotal", sw: "Jumla ndogo" },
  cartDeliveryLine: { en: "Delivery", sw: "Usafirishaji" },
  cartTotal: { en: "Total", sw: "Jumla" },
  cartAddressLabel: {
    en: "Address (estate, street, landmark)",
    sw: "Anwani (mtaa, barabara, alama)",
  },
  cartAddressPlaceholder: {
    en: "e.g. Section 58, near Naivas",
    sw: "mf. Section 58, karibu na Naivas",
  },
  cartPhoneLabel: {
    en: "Phone for rider / SMS updates",
    sw: "Simu kwa dereva / SMS",
  },
  cartPhonePlaceholder: { en: "0712 345 678", sw: "0712 345 678" },
  orderGroupActive: { en: "Active", sw: "Hai" },
  orderGroupPast: { en: "Past", sw: "Iliyopita" },
  orderStatusPlaced: { en: "Placed", sw: "Imewekwa" },
  orderStatusAccepted: { en: "Accepted", sw: "Imekubaliwa" },
  orderStatusOut: { en: "Out for delivery", sw: "Njiani" },
  orderStatusDelivered: { en: "Delivered", sw: "Imefika" },
  orderStatusCancelled: { en: "Cancelled", sw: "Imefutwa" },
  orderTrackStepPlaced: { en: "Placed", sw: "Imewekwa" },
  orderTrackStepAccepted: { en: "Accepted", sw: "Imekubaliwa" },
  orderTrackStepOut: { en: "Out for delivery", sw: "Njiani" },
  orderTrackStepDelivered: { en: "Delivered", sw: "Imefika" },
  orderDeliveryCodeLabel: { en: "Delivery code", sw: "Msimbo wa usafirishaji" },
  orderDeliveryCodeRider: {
    en: "Give this code to the rider on delivery.",
    sw: "Mpe dereva msimbo huu wakati wa kufikisha.",
  },
  orderCopyId: { en: "Copy order ID", sw: "Nakili kitambulisho cha agizo" },
  orderCopyCode: { en: "Copy delivery code", sw: "Nakili msimbo wa usafirishaji" },
  orderIdCopied: { en: "Order ID copied", sw: "Kitambulisho cha agizo kimenakiliwa" },
  orderCodeCopied: { en: "Delivery code copied", sw: "Msimbo wa usafirishaji umenakiliwa" },
  orderDemoTracking: { en: "Demo tracking", sw: "Ufuatiliaji wa majira" },
  orderMessageSeller: { en: "Message seller", sw: "Tuma ujumbe kwa muuzaji" },
  orderPlacedTitle: { en: "Order placed", sw: "Agizo limewekwa" },
  orderContinueShopping: { en: "Continue shopping", sw: "Endelea kununua" },
  orderFirstFreeDelivery: {
    en: "First order: free delivery",
    sw: "Agizo la kwanza: usafirishaji bure",
  },
  orderTrackBack: { en: "Back to orders", sw: "Rudi kwa maagizo" },
  orderItemsUnknown: { en: "Items in this order", sw: "Bidhaa katika agizo hili" },
  orderItemsMore: { en: "{title} +{n} more", sw: "{title} +{n} zaidi" },
  accRoleBuyer: { en: "Buyer", sw: "Mnunuzi" },
  accRoleVendor: { en: "Vendor", sw: "Muuzaji" },
  accModeShopping: { en: "Shopping", sw: "Ununuzi" },
  accModeSelling: { en: "Selling", sw: "Uuzaji" },
  accModeAria: {
    en: "Shopping or selling",
    sw: "Ununuzi au uuzaji",
  },
  accStatusPending: { en: "Pending approval", sw: "Inasubiri idhini" },
  accStatusUnverified: { en: "Unverified", sw: "Haijathibitishwa" },
  accSectionSelling: { en: "Selling", sw: "Uuzaji" },
  accSectionShopping: { en: "Shopping", sw: "Ununuzi" },
  accSectionApp: { en: "App", sw: "Programu" },
  accMyShop: { en: "My shop", sw: "Duka langu" },
  accOrdersBuyer: { en: "Orders as buyer", sw: "Maagizo kama mnunuzi" },
  accSaved: { en: "Saved items", sw: "Vilivyohifadhiwa" },
  accAddresses: { en: "Addresses", sw: "Anwani" },
  accHelp: { en: "Help and support", sw: "Msaada" },
  accApplicationStatus: { en: "Application status", sw: "Hali ya ombi" },
  accApplyAgain: { en: "Apply again", sw: "Omba tena" },
  accSell: { en: "Sell on NakuruHub", sw: "Uza kwenye NakuruHub" },
  accSellPromoSub: {
    en: "List products, property, or services.",
    sw: "Orodhesha bidhaa, mali, au huduma.",
  },
  accMyOrders: { en: "My orders", sw: "Maagizo yangu" },
  accShopAfterApproval: {
    en: "Available after approval",
    sw: "Inapatikana baada ya idhini",
  },
  accGetVerifiedTitle: { en: "Get Verified", sw: "Pata Thibitisho" },
  accGetVerifiedSub: {
    en: "Unlock M-Pesa upfront on your orders.",
    sw: "Fungua M-Pesa mapema kwa maagizo yako.",
  },
  accVerifyStepId: { en: "ID check", sw: "Ukaguzi wa kitambulisho" },
  accVerifyStepShop: { en: "Shop check", sw: "Ukaguzi wa duka" },
  accContactSupport: { en: "Contact support", sw: "Wasiliana na msaada" },
  accInstallSub: {
    en: "Open full-screen from your home screen.",
    sw: "Fungua skrini nzima kutoka skrini ya nyumbani.",
  },
  accLanguage: { en: "Language", sw: "Lugha" },
  accLanguageEn: { en: "English", sw: "Kiingereza" },
  accLanguageSw: { en: "Kiswahili", sw: "Kiswahili" },
  accLanguageSheetTitle: { en: "Language", sw: "Lugha" },
  accSignOut: { en: "Sign out", sw: "Toka" },
  accSignOutConfirmTitle: {
    en: "Sign out of NakuruHub?",
    sw: "Toka kwenye NakuruHub?",
  },
  accSignOutConfirm: { en: "Sign out", sw: "Toka" },
  accSignOutCancel: { en: "Cancel", sw: "Ghairi" },
  accFooter: { en: "NakuruHub · Nakuru, Kenya", sw: "NakuruHub · Nakuru, Kenya" },
  accSignedOut: { en: "Signed out", sw: "Umetoka" },
  signInGuestBrowse: {
    en: "Browse without signing in",
    sw: "Vinjari bila kuingia",
  },
  signInGuestNote: {
    en: "You only sign in when you order, list, or save.",
    sw: "Utaingia tu unapoagiza, kuorodhesha au kuhifadhi.",
  },
  signInRemember: {
    en: "Keep me signed in",
    sw: "Nikumbuke",
  },
  signInTitle: { en: "Welcome back", sw: "Karibu tena" },
  signInLead: {
    en: "We’ll email a 6-digit code — no password needed.",
    sw: "Tutakutumia kodi ya tarakimu 6 — bila nenosiri.",
  },
  signInHelper: {
    en: "The code expires in 10 minutes.",
    sw: "Kodi inaisha baada ya dakika 10.",
  },
  signInEmailLabel: { en: "Email", sw: "Barua pepe" },
  signInEmailError: {
    en: "Enter a valid email address",
    sw: "Weka barua pepe sahihi",
  },
  signInSending: { en: "Sending…", sw: "Inatuma…" },
  signInCta: { en: "Send code", sw: "Tuma kodi" },
  signInCodeTitle: { en: "Check your email", sw: "Angalia barua pepe" },
  signInCodeSent: {
    en: "Code sent to {email}",
    sw: "Kodi imetumwa kwa {email}",
  },
  signInChangeEmail: { en: "Change email", sw: "Badilisha barua pepe" },
  signInExpiry: {
    en: "Expires in 10 minutes.",
    sw: "Inaisha baada ya dakika 10.",
  },
  signInResend: { en: "Resend code", sw: "Tuma kodi tena" },
  signInResendIn: { en: "Resend in {n}s", sw: "Tuma tena baada ya {n}s" },
  signInWrongCode: {
    en: "That code doesn’t match. Try again.",
    sw: "Kodi hailingani. Jaribu tena.",
  },
  signInExpired: {
    en: "This code expired. Request a new one.",
    sw: "Kodi hii imeisha. Omba nyingine.",
  },
  signInRateLimit: {
    en: "Too many codes sent. Wait a few minutes.",
    sw: "Kodi nyingi zimetumwa. Subiri dakika chache.",
  },
  signInVerifying: { en: "Verifying…", sw: "Inathibitisha…" },
  signInVerifyCta: { en: "Verify and sign in", sw: "Thibitisha na uingie" },
  signInSuccess: { en: "Signed in", sw: "Umeingia" },
  signInContextOrders: {
    en: "Sign in to see your orders",
    sw: "Ingia ili uone maagizo yako",
  },
  signInContextSaved: {
    en: "Sign in to see your saved items",
    sw: "Ingia ili uone vilivyohifadhiwa",
  },
  signInTermsBefore: {
    en: "By continuing you agree to our",
    sw: "Kwa kuendelea unakubali",
  },
  signInTerms: { en: "Terms", sw: "Masharti" },
  signInPrivacy: { en: "Privacy Policy", sw: "Sera ya faragha" },
  signInPhoneSoon: {
    en: "Phone sign-in is coming soon. Use email for now.",
    sw: "Kuingia kwa simu inakuja. Tumia barua pepe kwa sasa.",
  },
  vendorApplySameAccount: {
    en: "This uses the same account as shopping — not a second login.",
    sw: "Hii inatumia akaunti ile ile ya ununuzi — si kuingia kwa pili.",
  },
  accUploadPhotoAria: {
    en: "Upload profile picture",
    sw: "Pakia picha ya wasifu",
  },
  accDefaultName: { en: "Your account", sw: "Akaunti yako" },
  cartPhoneHelper: {
    en: "Used so the rider can call you — not for sign-in codes.",
    sw: "Kwa dereva kuwapigia — si kwa kodi za kuingia.",
  },
  assistantTitle: {
    en: "NakuruHub Assistant",
    sw: "Msaidizi wa NakuruHub",
  },
  assistantDemoChip: { en: "Demo", sw: "Demo" },
  assistantClear: { en: "Clear chat", sw: "Futa mazungumzo" },
  assistantMenuAria: { en: "Assistant menu", sw: "Menyu ya msaidizi" },
  assistantEmptyGreeting: {
    en: "Demo assistant — ask about Verified, payments, delivery, or selling.",
    sw: "Msaidizi wa demo — uliza kuhusu Verified, malipo, usafirishaji au kuuza.",
  },
  assistantPlaceholder: {
    en: "Ask a question…",
    sw: "Uliza swali…",
  },
  assistantSend: { en: "Send", sw: "Tuma" },
  assistantStop: { en: "Stop", sw: "Simama" },
  assistantRetry: { en: "Retry", sw: "Jaribu tena" },
  assistantOffline: {
    en: "You're offline. The assistant needs a connection in live mode.",
    sw: "Huna mtandao. Msaidizi anahitaji muunganisho katika hali ya mtandaoni.",
  },
  assistantEntryHeader: {
    en: "Ask the assistant",
    sw: "Uliza msaidizi",
  },
  assistantEntryProduct: {
    en: "Ask about this listing",
    sw: "Uliza kuhusu tangazo hili",
  },
  assistantEntryCartPay: {
    en: "Need help with payment?",
    sw: "Unahitaji msaada wa malipo?",
  },
  assistantEntrySearch: {
    en: "Ask the assistant",
    sw: "Uliza msaidizi",
  },
  assistantEntryAccount: {
    en: "Ask the assistant",
    sw: "Uliza msaidizi",
  },
  assistantEntryHelp: {
    en: "Ask the assistant",
    sw: "Uliza msaidizi",
  },
  assistantFabLabel: {
    en: "Ask NakuruHub",
    sw: "Uliza NakuruHub",
  },
  assistantFabAria: {
    en: "Ask the NakuruHub assistant",
    sw: "Uliza msaidizi wa NakuruHub",
  },
  assistantCloseAria: {
    en: "Close assistant",
    sw: "Funga msaidizi",
  },
  discoverEyebrow: { en: "The local marketplace", sw: "Soko la nyumbani" },
  discoverTitle: { en: "Discover around you", sw: "Gundua karibu nawe" },
  discoverSub: {
    en: "Hand-picked local listings and opportunities.",
    sw: "Matangazo ya nyumbani yaliyochaguliwa.",
  },
  clearFilters: { en: "Clear filters", sw: "Futa vichujio" },
  priceFrom: { en: "From", sw: "Kuanzia" },
  chipQuote: { en: "Quote", sw: "Bei" },
  chipViewing: { en: "Viewing", sw: "Kutembelea" },
  chipCod: { en: "Pay on delivery", sw: "Lipa ukifika" },
  chipFreeDelivery: { en: "Free delivery", sw: "Usafirishaji bure" },
  browseCategories: { en: "Browse categories", sw: "Vinjari kategoria" },
  freshInZoneSeeAll: { en: "See all", sw: "Angalia zote" },
  servicesNearYou: { en: "Services near you", sw: "Huduma karibu nawe" },
  propertyAndCars: { en: "Property and cars", sw: "Mali na magari" },
  moreToExplore: { en: "More to explore", sw: "Zaidi ya kuchunguza" },
  filterBarSort: { en: "Sort", sw: "Panga" },
  filterBarFilter: { en: "Filter", sw: "Chuja" },
  filterSheetTitle: { en: "Filters", sw: "Vichujio" },
  sortSheetTitle: { en: "Sort listings", sw: "Panga matangazo" },
  sortNearest: { en: "Nearest zone", sw: "Eneo la karibu" },
  filterPriceRange: { en: "Price range", sw: "Kiwango cha bei" },
  filterPriceMin: { en: "Min", sw: "Chini" },
  filterPriceMax: { en: "Max", sw: "Juu" },
  filterZone: { en: "Zone", sw: "Eneo" },
  filterListingType: { en: "Listing type", sw: "Aina ya tangazo" },
  filterCategory: { en: "Category", sw: "Kategoria" },
  filterTypeAll: { en: "Any type", sw: "Aina yoyote" },
  filterTypeShop: { en: "Shop", sw: "Duka" },
  filterTypeServices: { en: "Services", sw: "Huduma" },
  filterTypeProperty: { en: "Property", sw: "Mali" },
  filterTypeCars: { en: "Cars", sw: "Magari" },
  filterApply: { en: "Show results", sw: "Onyesha matokeo" },
  filterVerifiedOnly: { en: "Verified only", sw: "Waliothibitishwa tu" },
  trustStripVerified: { en: "ID-checked", sw: "Kitambulisho" },
  trustStripPay: { en: "Pay on delivery", sw: "Lipa ukifika" },
  trustStripFreeJoin: { en: "Free to list", sw: "Bure kuorodhesha" },
  trustVerifyTitle: { en: "How we verify", sw: "Jinsi tunavyothibitisha" },
  trustVerifyBody: {
    en: "Sellers upload a government ID. We review it before they can list. Verified shops show a check on the card and on their profile.",
    sw: "Wauzaji wanapakia kitambulisho cha serikali. Tunakagua kabla ya kuorodhesha. Maduka yaliyothibitishwa yana alama kwenye kadi na wasifu.",
  },
  trustPayBody: {
    en: "Inspect the item when it arrives, then pay by M-Pesa or cash. You are not charged before delivery.",
    sw: "Kagua bidhaa inapofika, kisha lipa kwa M-Pesa au taslimu. Hutoziwi kabla ya kuwasilisha.",
  },
  resultCountLive: {
    en: "{n} results",
    sw: "Matokeo {n}",
  },
  loadMoreFallback: { en: "Load more", sw: "Pakia zaidi" },
  featuredFirst: { en: "Featured first", sw: "Maarufu kwanza" },
  viewDetails: { en: "View details", sw: "Tazama maelezo" },
  saveListingAria: { en: "Save listing", sw: "Hifadhi tangazo" },
  waSeller: { en: "WhatsApp seller", sw: "WhatsApp muuzaji" },
  waSellerMissing: {
    en: "Seller has not added WhatsApp yet.",
    sw: "Muuzaji hajahifadhi WhatsApp bado.",
  },
  commentsTitle: { en: "Comments", sw: "Maoni" },
  commentsEmpty: {
    en: "Be the first to ask a question",
    sw: "Kuwa wa kwanza kuuliza swali",
  },
  commentsPlaceholder: { en: "Write a comment", sw: "Andika maoni" },
  commentsSubmit: { en: "Post comment", sw: "Tuma maoni" },
  commentsSignIn: { en: "Sign in to comment", sw: "Ingia ili utoe maoni" },
  commentsDelete: { en: "Delete", sw: "Futa" },
  commentsLoading: { en: "Loading comments…", sw: "Inapakia maoni…" },
  commentsPostError: {
    en: "Couldn’t post comment.",
    sw: "Imeshindwa kutuma maoni.",
  },
  commentsLoadError: {
    en: "Couldn’t load comments.",
    sw: "Imeshindwa kupakia maoni.",
  },
  commentsForbidden: {
    en: "You can’t do that.",
    sw: "Huwezi kufanya hivyo.",
  },
  commentsRateLimited: {
    en: "Too many comments. Try again later.",
    sw: "Maoni mengi mno. Jaribu tena baadaye.",
  },
  commentsNotFound: {
    en: "This listing isn’t available.",
    sw: "Tangazo hili halipatikani.",
  },
  messagesTitle: { en: "In-app messages", sw: "Ujumbe katika programu" },
  messagesHint: {
    en: "Chat with the seller in NakuruHub.",
    sw: "Ongea na muuzaji ndani ya NakuruHub.",
  },
  messagesPlaceholder: {
    en: "Write your message…",
    sw: "Andika ujumbe wako…",
  },
  messagesSend: { en: "Send", sw: "Tuma" },
  messagesSignIn: {
    en: "Sign in to message",
    sw: "Ingia ili kutuma ujumbe",
  },
  messagesEmpty: {
    en: "No conversations yet. Message a seller from a listing.",
    sw: "Bado hakuna mazungumzo. Mtumie muuzaji kutoka tangazo.",
  },
  messagesSent: {
    en: "Message sent. Continue in your inbox.",
    sw: "Ujumbe umetumwa. Endelea katika kikasha.",
  },
  messagesOpenInbox: { en: "Open inbox", sw: "Fungua kikasha" },
  messagesPostError: {
    en: "Could not send message. Try again.",
    sw: "Haikuweza kutuma ujumbe. Jaribu tena.",
  },
  messagesLoadError: {
    en: "Could not load messages.",
    sw: "Haikuweza kupakia ujumbe.",
  },
  messagesForbidden: {
    en: "You can’t do that.",
    sw: "Huwezi kufanya hivyo.",
  },
  messagesRateLimited: {
    en: "Too many messages. Try again later.",
    sw: "Ujumbe mwingi mno. Jaribu tena baadaye.",
  },
  messagesNotFound: {
    en: "This listing isn’t available.",
    sw: "Tangazo hili halipatikani.",
  },
  messagesOwnProduct: {
    en: "You can’t message yourself on your own listing.",
    sw: "Huwezi kujitumia ujumbe kwenye tangazo lako.",
  },
  navExplore: { en: "Explore", sw: "Gundua" },
  navHow: { en: "How it works", sw: "Jinsi inavyofanya" },
  navSaved: { en: "Saved", sw: "Vilivyohifadhiwa" },
  postListing: { en: "Post a listing", sw: "Weka tangazo" },
  heroSidePostTitle: {
    en: "Post a listing",
    sw: "Weka tangazo",
  },
  heroSidePostCopy: {
    en: "Free to join and list — reach buyers across Nakuru.",
    sw: "Bure kujiunga na kuorodhesha — fika kwa wanunuzi Nakuru.",
  },
  heroSidePostLink: { en: "Start selling", sw: "Anza kuuza" },
  heroSidePayTitle: {
    en: "How pay on delivery works",
    sw: "Jinsi malipo ukifika hufanya",
  },
  heroSidePayCopy: {
    en: "Inspect first, then pay by M-Pesa or cash. ID-checked sellers.",
    sw: "Kagua kwanza, kisha lipa kwa M-Pesa au taslimu.",
  },
  heroSidePayLink: { en: "Learn more", sw: "Soma zaidi" },
  askChipPhones: { en: "Cheap phones", sw: "Simu nafuu" },
  askChipPlumber: { en: "Plumber near me", sw: "Bomba karibu" },
  askChipRent: { en: "Houses to rent", sw: "Nyumba kukodisha" },
  askChipVerified: { en: "Verified shops", sw: "Maduka yaliyothibitishwa" },
  allCategoriesTile: { en: "More", sw: "Zaidi" },
  footerAbout: { en: "About", sw: "Kuhusu" },
  footerHow: { en: "How it works", sw: "Jinsi inavyofanya" },
  footerVerified: { en: "Verified sellers", sw: "Wauzaji waliothibitishwa" },
  footerSell: { en: "Sell on NakuruHub", sw: "Uza kwenye NakuruHub" },
  footerHelp: { en: "Help / Contact", sw: "Msaada / Wasiliana" },
  footerTerms: { en: "Terms", sw: "Masharti" },
  footerPrivacy: { en: "Privacy", sw: "Faragha" },
  footerWhatsapp: { en: "WhatsApp support", sw: "Msaada wa WhatsApp" },
  footerPlace: { en: "Nakuru, Kenya", sw: "Nakuru, Kenya" },
  trustStripVerifiedSub: {
    en: "Sellers show a government ID before they list.",
    sw: "Wauzaji wanaonyesha kitambulisho kabla ya kuorodhesha.",
  },
  trustStripPaySub: {
    en: "Inspect the item, then pay M-Pesa or cash.",
    sw: "Kagua bidhaa, kisha lipa M-Pesa au taslimu.",
  },
  trustStripFreeSub: {
    en: "Join and list at no charge.",
    sw: "Jiunge na uorodhesha bila malipo.",
  },
};

const TOP_CATEGORY_LABELS: Record<
  TopCategorySlug,
  Record<LandingLang, string>
> = {
  phone: { en: "Smart phones", sw: "Simu mahiri" },
  tv: { en: "Televisions", sw: "Televisheni" },
  kitchen: { en: "Kitchen supplies", sw: "Vifaa vya jikoni" },
  dress: { en: "Fashion", sw: "Mitindo" },
  sneaker: { en: "Shoes", sw: "Viatu" },
  veg: { en: "Groceries", sw: "Vyakula" },
  watch: { en: "Watches", sw: "Saa" },
  rent: { en: "Homes to rent", sw: "Nyumba za kukodisha" },
  sale: { en: "Homes for sale", sw: "Nyumba za kuuza" },
  plot: { en: "Land", sw: "Ardhi" },
  toyota: { en: "Toyota", sw: "Toyota" },
  subaru: { en: "Subaru", sw: "Subaru" },
  electric: { en: "Electricians", sw: "Mafundi umeme" },
  clean: { en: "Cleaning", sw: "Usafishaji" },
  bnb: { en: "BnBs & apartments", sw: "BnB na vyumba" },
  hotel: { en: "Hotels", sw: "Hoteli" },
  short: { en: "Short stays", sw: "Malazi mafupi" },
  airport: { en: "Airport rides", sw: "Usafiri uwanja" },
  town: { en: "Town rides", sw: "Ndani ya mjini" },
  boda: { en: "Boda", sw: "Boda" },
  delivery: { en: "Delivery rider", sw: "Msafirishaji" },
  courier: { en: "Courier", sw: "Courier" },
};

const CAT_LABELS: Record<CategoryId, Record<LandingLang, string>> = {
  all: { en: "All", sw: "Yote" },
  shop: { en: "Shop", sw: "Duka" },
  property: { en: "Property", sw: "Mali isimu" },
  cars: { en: "Cars", sw: "Magari" },
  services: { en: "Services", sw: "Huduma" },
  stays: { en: "Stays", sw: "Malazi" },
  taxi: { en: "Taxi", sw: "Teksi" },
  rider: { en: "Rider", sw: "Rider" },
};

export function homeCopy(key: HomeCopyKey, lang: LandingLang): string {
  return COPY[key][lang];
}

export function homeCategoryLabel(id: string, lang: LandingLang): string {
  return CAT_LABELS[id as CategoryId]?.[lang] ?? id;
}

export function homeTopCategoryLabel(
  slug: string,
  lang: LandingLang,
): string {
  const row = TOP_CATEGORY_LABELS[slug as TopCategorySlug];
  return row?.[lang] ?? slug;
}

export const SLIDE_COPY_KEYS: [HomeCopyKey, HomeCopyKey][] = [
  ["slide0Title", "slide0Sub"],
  ["slide1Title", "slide1Sub"],
  ["slide2Title", "slide2Sub"],
];

const GROUP_DESC: Partial<Record<CategoryId, HomeCopyKey>> = {
  shop: "catGroupShopDesc",
  property: "catGroupPropertyDesc",
  cars: "catGroupCarsDesc",
  services: "catGroupServicesDesc",
  stays: "catGroupStaysDesc",
  taxi: "catGroupTaxiDesc",
  rider: "catGroupRiderDesc",
};

const GROUP_ALL: Partial<Record<CategoryId, HomeCopyKey>> = {
  shop: "allShop",
  property: "allProperty",
  cars: "allCars",
  services: "allServices",
  stays: "allStays",
  taxi: "allTaxi",
  rider: "allRiders",
};

export function homeCategoryGroupDesc(
  id: CategoryId,
  lang: LandingLang,
): string {
  const key = GROUP_DESC[id];
  return key ? homeCopy(key, lang) : "";
}

export function homeCategoryAllLabel(
  id: CategoryId,
  lang: LandingLang,
): string {
  const key = GROUP_ALL[id];
  return key ? homeCopy(key, lang) : homeCategoryLabel(id, lang);
}