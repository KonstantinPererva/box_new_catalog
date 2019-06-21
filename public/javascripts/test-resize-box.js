var Resizing = function(opt) {
    "use strict";

    var option = Object.assign({
        direction: undefined, //'horizontal' or 'vertical'
        node: undefined,
        lever: undefined,
        button: undefined,
        hide: undefined, //'left', 'right', 'top', 'bottom'
        boxLeft: undefined,
        boxRight: undefined,
        boxTop: undefined,
        boxBottom: undefined,
        resizeListener: undefined
    }, opt);

    var resizeBox = {
        hide: option.hide,
        dragObject: {},
        touches: {},

        node: function () {
            return document.querySelector(option.node) || null;
        },

        lever: function () {
            return resizeBox.node().querySelector(option.lever) || null;
        },

        button: function () {
            return resizeBox.lever().querySelector(option.button) || null;
        },

        boxLeft: function () {
            return resizeBox.node().querySelector(option.boxLeft) || null;
        },

        boxRight: function () {
            return resizeBox.node().querySelector(option.boxRight) || null;
        },

        boxTop: function () {
            return resizeBox.node().querySelector(option.boxTop) || null;
        },

        boxBottom: function () {
            return resizeBox.node().querySelector(option.boxBottom) || null;
        },

        getSizeBoxes : function (elem) {
            var elemWidth = elem.getBoundingClientRect().right - elem.getBoundingClientRect().left;
            var elemHeight = elem.getBoundingClientRect().bottom - elem.getBoundingClientRect().top;

            return {
                width: elemWidth,
                height: elemHeight
            };
        },

        setSizeBoxes : function() {
            if (option.direction === 'horizontal') {
                resizeBox.boxLeft().style.width = resizeBox.getSizeBoxes(resizeBox.boxLeft()).width + 'px';
                resizeBox.boxRight().style.width = resizeBox.getSizeBoxes(resizeBox.boxRight()).width + 'px';

                return
            }

            if (option.direction === 'vertical') {
                resizeBox.boxTop().style.height = resizeBox.getSizeBoxes(resizeBox.boxTop()).height + 'px';
                resizeBox.boxBottom().style.height = resizeBox.getSizeBoxes(resizeBox.boxBottom()).height + 'px';
            }
        },

        setLever : function(e) {
            if (e.which !== 1) return;

            var elem = e.target;

            if (!(elem === resizeBox.lever())) return;

            resizeBox.dragObject = {};
            resizeBox.dragObject.elem = elem;
            resizeBox.dragObject.downX = e.pageX;
            resizeBox.dragObject.downY = e.pageY;

            resizeBox.addBodyListenerMousemove();

            resizeBox.addBodyListenerMouseup();
        },

        toggleHideBox: function () {
            if (resizeBox.hide === 'left') {
                resizeBox.boxLeft().style.width = '';
                resizeBox.boxRight().style.width = '';
                resizeBox.boxLeft().classList.toggle('page-grid__cell-hidden');
                resizeBox.boxRight().classList.toggle('page-grid__cell-full');

                return;
            }

            if (resizeBox.hide === 'right') {
                resizeBox.boxLeft().style.width = '';
                resizeBox.boxRight().style.width = '';
                resizeBox.boxRight().classList.toggle('page-grid__cell-hidden');
                resizeBox.boxLeft().classList.toggle('page-grid__cell-full');

                return;
            }

            if (resizeBox.hide === 'top') {
                resizeBox.boxTop().style.height = '';
                resizeBox.boxBottom().style.height = '';
                resizeBox.boxTop().classList.toggle('page-grid__row-hidden');
                resizeBox.boxBottom().classList.toggle('page-grid__row-full');

                return;
            }

            if (resizeBox.hide === 'bottom') {
                resizeBox.boxTop().style.height = '';
                resizeBox.boxBottom().style.height = '';
                resizeBox.boxBottom().classList.toggle('page-grid__row-hidden');
                resizeBox.boxTop().classList.toggle('page-grid__row-full');
            }
        },

        listenerResizeBox: function () {
            if (option.resizeListener) option.resizeListener();
        },

        resize: function(e) {
            if (!resizeBox.dragObject.elem) return; // элемент не зажат

            resizeBox.listenerResizeBox();

            if (option.direction === 'horizontal') {
                var moveX = e.pageX - resizeBox.dragObject.downX;

                resizeBox.dragObject.downX += moveX;

                resizeBox.boxLeft().style.width = resizeBox.getSizeBoxes(resizeBox.boxLeft()).width + moveX + 'px';
                resizeBox.boxRight().style.width = resizeBox.getSizeBoxes(resizeBox.boxRight()).width - moveX + 'px';

                return;
            }

            if (option.direction === 'vertical') {
                var moveY = e.pageY - resizeBox.dragObject.downY;

                resizeBox.dragObject.downY += moveY;

                resizeBox.boxTop().style.height = resizeBox.getSizeBoxes(resizeBox.boxTop()).height + moveY + 'px';
                resizeBox.boxBottom().style.height = resizeBox.getSizeBoxes(resizeBox.boxBottom()).height - moveY + 'px';
            }
        },

        addBodyListenerMousemove : function () {
            return document.body.addEventListener('mousemove', resizeBox.resize);
        },

        addBodyListenerMousedown : function () {
            return document.body.addEventListener( 'mousedown', resizeBox.setLever );
        },

        addBodyListenerMouseup : function () {
            return document.body.addEventListener( 'mouseup', resizeBox.reset );
        },

        addButtonListenerClick : function () {
            return resizeBox.button().addEventListener( 'click', resizeBox.toggleHideBox );
        },

        removeBodyListenerMousemove: function () {
            if(option.direction === 'horizontal') {
                document.body.removeEventListener('mousemove', resizeBox.resizeX);
                return;
            }

            if(option.direction === 'vertical') {
                document.body.removeEventListener('mousemove', resizeBox.resizeY);
            }
        },

        reset : function () {
            resizeBox.dragObject = {};

            resizeBox.removeBodyListenerMousemove();
        },

        resetHideBox : function () {
            if(option.direction === 'horizontal') {
                resizeBox.boxLeft().style.width = '';
                resizeBox.boxRight().style.width = '';
                return;
            }

            if(option.direction === 'vertical') {
                resizeBox.boxTop().style.height = '';
                resizeBox.boxBottom().style.height = '';
            }
        },

        windowResize : function () {
            return window.addEventListener('resize', resizeBox.resetHideBox);
        },

        //Touch.............................

        touchStartMove : function (e) {

            var elem = e.target;

            if (!(elem === resizeBox.lever())) return;

            resizeBox.setSizeBoxes();

            resizeBox.touches = e.changedTouches;

            resizeBox.dragObject.downX = resizeBox.touches[0].pageX;

            resizeBox.dragObject.downY = resizeBox.touches[0].pageY;

            resizeBox.addBodyListenerTouchMove();

            resizeBox.addBodyListenerTouchEnd();
        },

        touchMove : function (e) {

            resizeBox.listenerResizeBox();

            var elem = e.target;

            if (option.direction === 'horizontal') {

                resizeBox.touches = e.changedTouches;

                var moveX = resizeBox.touches[0].pageX - resizeBox.dragObject.downX;

                resizeBox.dragObject.downX += moveX;

                resizeBox.boxLeft().style.width = resizeBox.getSizeBoxes(resizeBox.boxLeft()).width + moveX + 'px';
                resizeBox.boxRight().style.width = resizeBox.getSizeBoxes(resizeBox.boxRight()).width - moveX + 'px';

                return;
            }

            if (option.direction === 'vertical') {

                resizeBox.touches = e.changedTouches;

                var moveY = resizeBox.touches[0].pageY - resizeBox.dragObject.downY;

                resizeBox.dragObject.downY += moveY;

                resizeBox.boxTop().style.height = resizeBox.getSizeBoxes(resizeBox.boxTop()).height + moveY + 'px';
                resizeBox.boxBottom().style.height = resizeBox.getSizeBoxes(resizeBox.boxBottom()).height - moveY + 'px';
            }
        },

        touchEndMove : function () {
            resizeBox.dragObject = {};

            resizeBox.removeListenerTouch();
        },

        removeListenerTouch : function () {
            document.body.removeEventListener( 'touchmove', resizeBox.touchMove );

            document.body.removeEventListener( 'touchend', resizeBox.touchEndMove );
        },

        addBodyListenerTouchStart : function () {
            document.body.addEventListener( 'touchstart', resizeBox.touchStartMove );
        },

        addBodyListenerTouchMove : function () {
            document.body.addEventListener( 'touchmove', resizeBox.touchMove );
        },

        addBodyListenerTouchEnd : function () {
            document.body.addEventListener( 'touchend', resizeBox.touchEndMove );
        },

        //Touch.....End.....................

        init : function () {
            resizeBox.addBodyListenerMousedown();

            resizeBox.windowResize();

            resizeBox.addButtonListenerClick();

            resizeBox.addBodyListenerTouchStart();
        }
    };

    return {
        init: resizeBox.init
    }
};