var Filter = function() {
    var self = {
        getSizeBoxes : function (elem) {
            var elemWidth = elem.getBoundingClientRect().right - elem.getBoundingClientRect().left;
            var elemHeight = elem.getBoundingClientRect().bottom - elem.getBoundingClientRect().top;

            return {
                width: elemWidth,
                height: elemHeight
            };
        },

        getChildrenBoxes: function (elem) {
            return {
                children: function () {return elem.children},

                childrenSizes: function () {
                    var ch = [].slice.call(this.children());

                    return ch.map(function (el) {
                        el.size = self.getSizeBoxes(el);

                        return el;
                    })
                },

                filtered: function () {
                    return this.childrenSizes().filter(function (el) {
                        return el.size.height > 21 && el.size.width + 10 === self.getSizeBoxes(elem).width
                    });
                }
            }
        },

        childrenShare: function (elem, parent, widthRemainder, parentWidth) {
            var textBlock = elem.querySelector('.catalog-filter-selected-link__text');
            var text = textBlock.textContent;
            var textAdd = '';
            var postTextAdd = '';
            var block = null;
            var firstBlock = true;

            elem.textArr = text.split(' ');

            for (var j = 0; j < elem.textArr.length; j++) {
                textAdd += elem.textArr[j] + " ";

                if (j === elem.textArr.length - 1) {
                    block = self.newBlockTrimmingLeft(textAdd);
                    parent.insertBefore(block, elem);
                } else {
                    block = self.newBlockTrimmingRight(textAdd);
                    parent.insertBefore(block, elem);
                }

                var sizePost = self.getSizeBoxes(block);

                if (sizePost.height > 21 || sizePost.width + 10 >= widthRemainder) {
                    block.remove();

                    if (firstBlock) {
                        if (sizePost.width + 10 >= widthRemainder) {
                            block = self.newBlockTrimmingRight(postTextAdd);
                            addBlock(block);
                            firstBlock = false;
                            continue;
                        }
                    }

                    if (sizePost.height > 21) {
                        block = self.newBlockTrimmingBoth(postTextAdd);
                        addBlock(block);
                        continue;
                    }

                    function addBlock(block) {
                        parent.insertBefore(block, elem);
                        j--;
                        textAdd = '';
                        widthRemainder = parentWidth;
                        console.log(widthRemainder);
                    }

                } else {
                    postTextAdd = textAdd;
                }

                if (j !== elem.textArr.length - 1) {
                    block.remove();
                }
            }

            elem.remove();
        },

        newBlockTrimmingRight: function(text) {
            var li = document.createElement('li');
            li.classList.add('catalog-filter-selected-item');
            li.classList.add('right');

            var block = document.createElement('span');
            block.classList.add('catalog-filter-selected-link');

            var blockText = document.createElement('span');
            blockText.classList.add('catalog-filter-selected-link__text');

            var trimmingRight = `
                <svg class="catalog-filter-selected-link__trimming catalog-filter-selected-link__trimming_right" width="3" height="21" viewBox="0 0 3 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 2.5L2.5 0V2.5V5L0 2.5Z" fill="white"/>
                    <path d="M0 6.5L2.5 4V6.5V9L0 6.5Z" fill="white"/>
                    <path d="M0 14.5L2.5 12V14.5V17L0 14.5Z" fill="white"/>
                    <path d="M0 18.5L2.5 16V18.5V21L0 18.5Z" fill="white"/>
                    <path d="M0 10.5L2.5 8V10.5V13L0 10.5Z" fill="white"/>
                </svg>
            `;

            var ico = document.createElement('span');
            ico.innerHTML = trimmingRight;

            blockText.textContent = text;

            block.appendChild(blockText);
            block.appendChild(ico);
            li.appendChild(block);

            return li;
        },

        newBlockTrimmingLeft: function(text) {
            var li = document.createElement('li');
            li.classList.add('catalog-filter-selected-item');
            li.classList.add('left');

            var block = document.createElement('span');
            block.classList.add('catalog-filter-selected-link');

            var blockText = document.createElement('span');
            blockText.classList.add('catalog-filter-selected-link__text');

            var trimmingLeft = `
                <svg class="catalog-filter-selected-link__trimming catalog-filter-selected-link__trimming_left" width="3" height="21" viewBox="0 0 3 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 14.5L4.05312e-06 17L4.05312e-06 14.5V12L2.5 14.5Z" fill="white"/>
                    <path d="M2.5 18.5L4.05312e-06 21L4.05312e-06 18.5V16L2.5 18.5Z" fill="white"/>
                    <path d="M2.5 10.5L4.05312e-06 13L4.05312e-06 10.5V8L2.5 10.5Z" fill="white"/>
                    <path d="M2.5 2.5L4.05312e-06 5L4.05312e-06 2.5V0L2.5 2.5Z" fill="white"/>
                    <path d="M2.5 6.5L4.05312e-06 9L4.05312e-06 6.5V4L2.5 6.5Z" fill="white"/>
                </svg>
            `;

            var ico = document.createElement('span');
            ico.innerHTML = trimmingLeft;

            blockText.textContent = text;

            block.appendChild(blockText);
            block.appendChild(ico);
            li.appendChild(block);

            return li;
        },

        newBlockTrimmingBoth: function(text) {
            var li = document.createElement('li');
            li.classList.add('catalog-filter-selected-item');
            li.classList.add('both');

            var block = document.createElement('span');
            block.classList.add('catalog-filter-selected-link');

            var blockText = document.createElement('span');
            blockText.classList.add('catalog-filter-selected-link__text');

            var trimmingRight = `
                <svg class="catalog-filter-selected-link__trimming catalog-filter-selected-link__trimming_right" width="3" height="21" viewBox="0 0 3 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 2.5L2.5 0V2.5V5L0 2.5Z" fill="white"/>
                    <path d="M0 6.5L2.5 4V6.5V9L0 6.5Z" fill="white"/>
                    <path d="M0 14.5L2.5 12V14.5V17L0 14.5Z" fill="white"/>
                    <path d="M0 18.5L2.5 16V18.5V21L0 18.5Z" fill="white"/>
                    <path d="M0 10.5L2.5 8V10.5V13L0 10.5Z" fill="white"/>
                </svg>
            `;

            var trimmingLeft = `
                <svg class="catalog-filter-selected-link__trimming catalog-filter-selected-link__trimming_left" width="3" height="21" viewBox="0 0 3 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 14.5L4.05312e-06 17L4.05312e-06 14.5V12L2.5 14.5Z" fill="white"/>
                    <path d="M2.5 18.5L4.05312e-06 21L4.05312e-06 18.5V16L2.5 18.5Z" fill="white"/>
                    <path d="M2.5 10.5L4.05312e-06 13L4.05312e-06 10.5V8L2.5 10.5Z" fill="white"/>
                    <path d="M2.5 2.5L4.05312e-06 5L4.05312e-06 2.5V0L2.5 2.5Z" fill="white"/>
                    <path d="M2.5 6.5L4.05312e-06 9L4.05312e-06 6.5V4L2.5 6.5Z" fill="white"/>
                </svg>
            `;

            var ico = document.createElement('span');
            ico.innerHTML = trimmingLeft + trimmingRight;

            blockText.textContent = text;

            block.appendChild(blockText);
            block.appendChild(ico);
            li.appendChild(block);

            return li;
        },

        counterWidth: function (elem) {
            var ch = self.getChildrenBoxes(elem).childrenSizes();
            var counter = 0;
            var parentWidth = self.getSizeBoxes(elem).width;
            var widthRemainder = self.getSizeBoxes(elem).width;

            ch.forEach(function (el) {
                if (counter + el.size.width + 10 < parentWidth) {
                    counter += el.size.width + 10;
                    widthRemainder = parentWidth - counter;
                } else {
                    if (el.size.width + 10 === parentWidth && el.size.height > 21) {
                        self.childrenShare(el, elem, widthRemainder, parentWidth);
                    }

                    counter = 0;
                    widthRemainder = self.getSizeBoxes(elem).width;
                }
            });
        }
    };

    return self;
};

var filter = new Filter();

var par = document.querySelector('.catalog-filter-list');

filter.counterWidth(par);