function togglePassword(options) {
    var settings = $.extend({
        field: ""
    }, options);

    var control = $(settings.field).find('input[type="checkbox"]');
    var field = $(settings.field).find('.inputfield');

    control.bind('click', function () {
        if (control.is(':checked')) {
            field.attr('type', 'text');
        } else {
            field.attr('type', 'password');
        }
    });
}
$(function () {
    var page = {
        reviewPage: $('#sportpartner-review-page'),
        introducePage: $('#introduce-page')
    };

    //matched item block
    $("body").on("click", ".match-avatar", function () {
        $(this).closest('.match-block').removeClass('showMessagePanel');
        $(this).closest('.match-block').removeClass('showPanelFullDescription');
    });
    $("body").on("click", ".btn-show-message-panel:not(.status-disabled):not(.no-click-event)", function () {
        $(this).closest('.match-block').addClass('showMessagePanel');
        $(this).closest('.match-block').removeClass('showPanelFullDescription');
        $(this).closest('.match-block').find("textarea").html(IFD.utils.getData("coppiedFirstMessage"));
    });
    $("body").on("click", ".close-panel-send-message", function () {
        $(this).closest('.match-block').removeClass('showMessagePanel');
    });
    $("body").on("click", ".read-more", function () {
        $(this).closest('.match-block').addClass('showPanelFullDescription');
        setTimeout(function () {
            $(".match-block .panel-full-description .content").getNiceScroll().resize();
        }, 500);
    });
    $("body").on("click", ".container-send-photo-request", function () {
        $(this).closest('.match-block').removeClass('showPanelFullDescription');
    });

    //main navigation
    $("#main-navigation").mmenu({
        extensions: ["border-none", "position-front", "pagedim-black"],
        offCanvas: true,
        navbar: {
            title: "Menu"
        },
        navbars: {
            content: ["close", "title"],
            height: 1
        }
    }, {

        });
    //common
    var options = [];

    $('.dropdown-menu .custom-checkbox').on('click', function (event) {
        var $target = $(event.currentTarget),
            val = $target.attr('data-value'),
            $inp = $target.find('input'),
            idx;

        if ((idx = options.indexOf(val)) > -1) {
            options.splice(idx, 1);
            setTimeout(function () {
                $inp.prop('checked', false);
            }, 0);
        } else {
            options.push(val);
            setTimeout(function () {
                $inp.prop('checked', true);
            }, 0);
        }
        //after click
        if (!$($inp[0]).is(':checked')) {
            IFD.matches.searcher.searchData[val] = true;
            IFD.matches.searcher.searchMatches();
            $($inp[0]).closest('.customize-checkbox').addClass('active');
        } else {
            IFD.matches.searcher.searchData[val] = false;
            IFD.matches.searcher.searchMatches();
            $($inp[0]).closest('.customize-checkbox').removeClass('active');
        }

        $(event.target).blur();
        return false;
    });

    // style of [Select Sports]
    var cbSports = $('.customize-checkbox');
    cbSports.each(function () {
        var _this = $(this);
        var checkbox = _this.find('input[type="checkbox"], input[type="radio"]');
        checkbox.change(function () {
            if (checkbox.is(':checked')) {
                _this.addClass('active');
            } else {
                _this.removeClass('active');
            }
            var radios = $('.customize-checkbox input[type="radio"]');
            if (radios.length > 0) {
                radios.each(function () {
                    if (!$(this).is(':checked')) {
                        $(this).closest('.customize-checkbox').removeClass('active');
                    }
                });
            }
        });
    });
    //end common

    //page login form
    var loginFormPage = $('.page-login-form');
    if (loginFormPage.length > 0) {
        togglePassword({
            field: "#input-password"
        });
        // reset password page
        togglePassword({
            field: "#enter-new-password"
        });
        togglePassword({
            field: "#reenter-new-password"
        });
    }
    //page sign up form
    var pageSignUpForm = $('#page-sign-up-form');
    if (pageSignUpForm.length > 0) {
        togglePassword({
            field: '#account-detail-password'
        });

        //slider ages
        var sliderAgesSignUp = pageSignUpForm.find('[name="range-age"]');
        sliderAgesSignUp.bootstrapSlider();
        pageSignUpForm.find('.min-slider-handle').html(20);
        pageSignUpForm.find('.max-slider-handle').html(30);

        sliderAgesSignUp.on('change', function (objValue) {
            pageSignUpForm.find('.min-slider-handle').html(objValue.value.newValue[0]);
            pageSignUpForm.find('.max-slider-handle').html(objValue.value.newValue[1]);

            pageSignUpForm.find('.minValue').html(objValue.value.newValue[0]);
            pageSignUpForm.find('.maxValue').html(objValue.value.newValue[1]);
        });
    }

    var pageMyProfileForm = $('#page-my-profile-form');
    if (pageMyProfileForm.length > 0) {
        //slider ages
        var sliderAges = pageMyProfileForm.find('[name="range-age"]');
        sliderAges.bootstrapSlider();
        var $min = $('#age-range-settings .minValue');
        var $max = $('#age-range-settings .maxValue');
        pageMyProfileForm.find('#age-range-settings').find('.min-slider-handle').html($min.html().trim());
        pageMyProfileForm.find('#age-range-settings').find('.max-slider-handle').html($max.html().trim());

        sliderAges.on('change', function (objValue) {
            pageMyProfileForm.find('#age-range-settings').find('.min-slider-handle').html(objValue.value.newValue[0]);
            pageMyProfileForm.find('#age-range-settings').find('.max-slider-handle').html(objValue.value.newValue[1]);

            pageMyProfileForm.find('#age-range-settings').find('.minValue').html(objValue.value.newValue[0]);
            pageMyProfileForm.find('#age-range-settings').find('.maxValue').html(objValue.value.newValue[1]);
        });

        var sliderDistance = pageMyProfileForm.find('[name="range-distance"]');
        sliderDistance.bootstrapSlider();
        var $distance = $('#distance-settings .value');
        pageMyProfileForm.find('#distance-settings').find('.min-slider-handle').html($distance.html().trim());
        sliderDistance.on('change', function (objValue) {
            pageMyProfileForm.find('#distance-settings').find('.min-slider-handle').html(objValue.value.newValue);
            // pageMyProfileForm.find('.max-slider-handle').html(objValue.value.newValue[1]);

            pageMyProfileForm.find('#distance-settings').find('.value').html(objValue.value.newValue);
            // pageMyProfileForm.find('.maxValue').html(objValue.value.newValue[1]);
        });
    }


    //demo auto-complete 

    var txtSearchMatched = $('.input-search');
    var valueSearch = '';

    if (txtSearchMatched.length > 0) {
        txtSearchMatched.autoComplete({
            minChars: 3,
            cache: false,
            delay: 1,
            source: function (term, suggest) {
                valueSearch = term;
                var suggestions = [];

                var base = "/Matches/AjaxSuggestScreenName";
                var url = base + "/" + "?query=" + term;
                $.ajax({
                    type: "GET",
                    url: url,
                    dataType: "json",
                    success: function (response) {
                        for (i = 0; i < response.length; i++) {
                            // if (~response[i].toLowerCase().indexOf(term)) {
                            //     suggestions.push({
                            //         id: i + 1,
                            //         name: response[i]
                            //     });
                            // }
                            suggestions.push({
                                id: i + 1,
                                name: response[i]
                            });
                        }
                        if (suggestions.length === 0) {
                            suggest([{
                                id: -1,
                                message: "no data found"
                            }]);
                        } else {
                            suggestions.push({
                                id: 0,
                                name: "Show all results with " + txtSearchMatched.val()
                            });
                            suggest(suggestions);
                        }
                    },
                    failure: function (response) {
                        console.log("error on autocomplete", response);
                    }
                });
            },
            renderItem: function (item, search) {
                search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
                if (item.id === -1) {
                    return '<div class="autocomplete-suggestion" data-values="-1">' + item.message + '</div>';
                }
                return '<div class="autocomplete-suggestion" data-text="' + item.name + '" data-values="' + item.id + '"><span>' + item.name.replace(re, "<b>$1</b>") + '</span><img src="/images/icons-solid/enter.svg" /></div>';
            },
            onSelect: function (e, term, item) {
                if (item.data("values") === -1) {
                    return;
                }
                var text;
                if (item.data("values") === 0) {
                    text = valueSearch;
                    txtSearchMatched.val(valueSearch);
                } else {
                    text = item.data("text");
                    txtSearchMatched.val(item.data("text"));
                }
                IFD.matches.searcher.screenName = text;
                IFD.matches.searcher.searchMatches();
            }
        });
    }

    // IMPLEMENT IN CUSTOM CODE
    // // emoticons
    // // https://github.com/diy/jquery-emojiarea
    // $('.message-input').emojiarea({
    //     wysiwyg: false
    // });

    htmlEntities = function (str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    escapeRegex = function (str) {
        return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    };
    createIcon = function (group, emoji) {
        var filename = $.emojiarea.icons[group].icons[emoji];
        var path = $.emojiarea.path || '';
        if (path.length && path.charAt(path.length - 1) !== '/') {
            path += '/';
        }
        return '<img src="' + path + filename + '" alt="' + htmlEntities(emoji) + '">';
    };
    var messageContent = $('.message');
    var emojis = $.emojiarea.icons;
    $.each(messageContent, function () {
        var html = $(this).html();
        for (var group in emojis) {
            for (var key in emojis[group].icons) {
                if (emojis[group].icons.hasOwnProperty(key)) {
                    html = html.replace(new RegExp(escapeRegex(key), 'g'), createIcon(group, key));
                }
            }
        }
        $(this).html(html);
    });


    //equal height chat block and profile block
    // $('.equalHeight').matchHeight({
    //   target: '.information'
    // });

    // show tooltip
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();

    // show profile
    $('.btn-show-profile').on('click', function () {
        if ($('.panel-profile.messages-box-screen').hasClass('showProfilePanel')) {
            $('.panel-profile.messages-box-screen').removeClass('showProfilePanel');
        }
        else {
            $('.panel-profile.messages-box-screen').addClass('showProfilePanel');
        }
        afterToggleProfileSidebar();
    });
    // close profile
    $('.btn.close-profile').on('click', function () {
        $('.panel-profile.messages-box-screen').removeClass('showProfilePanel');
        afterToggleProfileSidebar();
    });

    var afterToggleProfileSidebar = function () {
        setTimeout(function () {
            $("#message-history").getNiceScroll().resize();
            $(".messages-box-screen .messages-list").getNiceScroll().resize();
            setScrollerForProfile();
        }, 500);
    };

    // profile+settings+helps page
    var settingPage = $('#page-my-profile-form');
    if (settingPage.length > 0) {
        togglePassword({
            field: "#input-password-view"
        });
    }

    // layout page review
    // DOCS: https://isotope.metafizzy.co/events.html
    if (page.reviewPage.length > 0) {
        var gridItemPeopleSaid = $('.grid-people-said').isotope({
            itemSelector: '.block-member-said',
            masonry: {
                columnWidth: 340,
                gutter: 30,
                horizontalOrder: true
            }
        });
        //  $gridItemPeopleSaid.isotope('reloadItems')
    }

    // introduce page
    if (page.introducePage.length > 0) {
        var initStep = 1;
        var introPage = page.introducePage;
        var btnNextStep = introPage.find('#intro-next-step');
        var dataContent = introPage.find('.content');
        btnNextStep.on('click', function () {
            if (initStep > 3) {
                return;
            }
            introPage.find('[data-step="' + initStep + '"]').removeClass('active');
            initStep++;
            introPage.find('[data-step="' + initStep + '"]').addClass('active');
            if (initStep == 3) {
                introPage.find('#intro-next-step').removeClass('active');
                introPage.find('#next-matches').addClass('active');
                introPage.find('.skip-introduction').fadeOut('fast');
            }
        });
    }

    // Scroll bar for term modal
    $("#termAndCondition").on('shown.bs.modal', function () {
        $("#termAndCondition .term-modal .content").getNiceScroll().resize();
    });

    // Popup cookie
    var cookieNameForPopup = 'sportpartner.cookie.acceptance';
    $(".cookie-bottom-bar .btn-accept").on("click", function () {
        var cookieValue = true;
        var option = {
            // Without expiration with 10000 days
            expires: 10000,
            domain: IFD.utils.getData("rootDomain"),
            path: "/"
        };
        $.cookie(cookieNameForPopup, cookieValue, option);
        $(".cookie-bottom-bar").addClass("d-none");
        return false;
    });
    (function () {
        var value = $.cookie(cookieNameForPopup);
        if (!value) {
            $(".cookie-bottom-bar").removeClass("d-none");
        }
    })();


    // Scroll description in profile
    var setScrollerForProfile = function () {
        var wrapper = $(".information.match-data");
        var total = wrapper.height();
        var desHeight = total -
            (wrapper.find(".panel-i-avatar").height() + wrapper.find(".match-info").height() +
                wrapper.find(".info .match-image").height() + wrapper.find(".info .about").height() +
                100);
        wrapper.find(".description").height(desHeight);
        wrapper.find(".description").getNiceScroll().resize();
    };
    setScrollerForProfile();
});
window.mobilecheck = function () {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};