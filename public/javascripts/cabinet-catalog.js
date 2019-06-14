/**
 * Created by max888 on 10.08.2016.
 */
function equals(firstObj, secondObject) {
    if ((null == firstObj) || (null == secondObject)) return false; //null сравниваем правильно. Если хоть в одном операнде значит false
    if (('object' != typeof firstObj) && ('object' != typeof secondObject))  return firstObj == secondObject;//оба из простых - сравнение простых значений.
    else if (('object' != typeof firstObj) || ('object' != typeof secondObject)) return false;//сравнивается простое значение с объектом - всегда не равны
    //в этой точке только если сравниваем именно объекты (оба)

    //отдельно для дат
    if ((firstObj instanceof Date) && (secondObject instanceof Date)) return firstObj.getTime() == secondObject.getTime(); //исключение для дат. сравним их по микросекундам
    else if ((firstObj instanceof Date) && (secondObject instanceof Date)) return false;//Если дата сравнивается с чем-то ещё -то всегда выдать несоответствие

    //далее сравниваем нормальные объекты
    var keysFirstObj = Object.keys(firstObj);
    var keysSecondObject = Object.keys(secondObject);
    if (keysFirstObj.length != keysSecondObject.length) {
        return false;
    }
    return !keysFirstObj.filter(function (key) {
        if (typeof firstObj[key] == "object" || Array.isArray(firstObj[key])) {
            return !equals(firstObj[key], secondObject[key]);
        } else {
            return firstObj[key] !== secondObject[key];
        }
    }).length;
}

function filterByFields(params) {

    if (params === undefined) {
        params = {}
    }

    if (params['LOAD_ITEMS'] === undefined) {
        params['LOAD_ITEMS'] = false;
    }
    if (params['ORDER_BY'] === undefined) {
        params['ORDER_BY'] = 'id';
    }
    if (params['ORDER'] === undefined) {
        params['ORDER'] = 'asc';
    }

    var fieldsData = Array();
    Array.prototype.forEach.call(document.querySelectorAll('.catalog-container .table-head input[data-name]'), function (item) {
        if (item.value !== '') {
            fieldsData.push({NAME: item.getAttribute('data-name'), VALUE: item.value});
        }
    });

    if (fieldsData.length > 0) {

        // set section code
        var menuAtemActive = null;
        menuAtemActive = document.querySelector('#horizontal-multilevel-menu a.active');
        if (menuAtemActive !== null) {
            var sectionId = null;
            sectionId = menuAtemActive.getAttribute('data-section_id');
            if (sectionId !== null) {
                fieldsData.push({NAME: 'section', VALUE: sectionId});
            }
        }

        numberPage = 1;
        if (window['FILTER_BY_FIELDS'] !== undefined) {
            if (window['FILTER_BY_FIELDS'].FIELDS_DATA !== undefined && equals(window['FILTER_BY_FIELDS'].FIELDS_DATA, fieldsData)) {
                if (params['LOAD_ITEMS'] === true && window['FILTER_BY_FIELDS'].CURRENT_PAGE !== undefined) {
                    numberPage = parseInt(window['FILTER_BY_FIELDS'].CURRENT_PAGE) + 1;
                    if ((numberPage * 50) > (parseInt(window['FILTER_BY_FIELDS'].COUNT_ELEMENT) + 50)) {
                        return true;
                    }
                }
            }
            else {
                window['FILTER_BY_FIELDS'] = undefined;
            }
        }

        strSearch = '';
        elSearch = document.querySelector('input[type="search"].inpsearchgm1');

        if (elSearch !== null && elSearch.value !== undefined && elSearch.value !== '' && elSearch.value !== null) {
            strSearch = elSearch.value;
        }

        $.ajax({
            url: '/local/ajax/newFilter.php',
            type: 'post',
            data: {
                FIELDS: fieldsData,
                NUMBER_PAGE: numberPage,
                ORDER_BY: params.ORDER_BY,
                ORDER: params.ORDER,
                SEARCH: strSearch
            },
            beforeSend: function () {
                $('#grid').addClass('loader');
            },
            success: function (data) {
                data = JSON.parse(data);
                if (!params['LOAD_ITEMS']) {
                    $('.table-cat tbody tr').remove();
                    document.getElementById('contTBgmTopTable').scrollTop = 0;
                    window['NEED_HEIGHT'] = undefined;
                }
                $('.table-cat tbody').append(data.CONTENT);
                $('.count_goods span').text('Просмотр 1 - ' + data.VIEW_ELEMENTS + ' из ' + data.COUNT_ELEMENT);
                window['FILTER_BY_FIELDS'] = {
                    FIELDS_DATA: fieldsData,
                    CURRENT_PAGE: data.CURRENT_PAGE,
                    COUNT_ELEMENT: data.COUNT_ELEMENT,
                    ORDER_BY: params.ORDER_BY,
                    ORDER: params.ORDER
                };
            },
            error: function (error) {
                console.log(error);
            },
            complete: function () {
                $('#grid').removeClass('loader');
                window.wmc.table.setColWidth();
            },

        });

        return true;
    }
    else {
        return false;
    }
}


// переменная для задержки ajax
var delayItemProductDataAjax = true;


// обьект для временнного хранения
var Temp = {

    ItemProduct: null,

    setItemProduct: function(item)
    {
        this.ItemProduct = item;
    },

    getItemProduct: function()
    {
        return this.ItemProduct;
    },

    removeItemProduct: function()
    {
        this.ItemProduct = null;
    }

};



// class to work with bonuses
class BonusActions {

    constructor()
    {
        this.elements = [];
        this.domElements = {
           bonus: document.body.querySelector('#bonus_count'),
           extrabonus: document.body.querySelector('#extrabonus_count'),
        };

        this.bonus = 0;
        this.extrabonus = 0;
        this.quantityProducts = 0;

        this.elementsLoader(this.domElements);
    }

    elementsLoader(domElements)
    {
        var elemKeys = Object.keys(domElements),
            elemLenght = elemKeys.length - 1,
            elem;

        for(var i = 0; i <= elemLenght; i++){

            elem = domElements[elemKeys[i]];

            if(elem !== undefined && elem !== null)
            {
                this.elements[elemKeys[i]] = elem;
            }
        }
    }



    // read DOM element
    readBonus()
    {
        var bonusEl = this.elements['bonus'];

        if(bonusEl !== undefined && bonusEl !== null)
        {
            this.bonus = Number.parseFloat(bonusEl.dataset.bonus_product).toFixed(2);
        }
        else
        {
            console.error('Error, element [bonus_count] is undefined !');
        }
    }

    readExtrabonus()
    {
        var extrabonusEl = this.elements['extrabonus'];;

        if(extrabonusEl !== undefined && extrabonusEl !== null)
        {
            this.extrabonus = Number.parseFloat(extrabonusEl.dataset.extrabonus_product).toFixed(2);
        }
        else
        {
            console.error('Error, element [extrabonus_count] is undefined !');
        }
    }



    // write DOM elements
    writeBonus()
    {
        this.calculateBonus();

        var bonusEl = this.elements['bonus'];

        if(bonusEl !== undefined && bonusEl !== null)
        {
            bonusEl.innerHTML = this.bonus;
        }
        else
        {
            console.error('Error, element [bonus_count] is undefined !');
        }
    }

    writeExtrabonus()
    {
        this.calculateExtrabonus();

        var extrabonusEl = this.elements['extrabonus'];

        if(extrabonusEl !== undefined && extrabonusEl !== null)
        {
            extrabonusEl.innerHTML = this.extrabonus;
        }
        else
        {
            console.error('Error, element [bonus_count] is undefined !');
        }
    }



    // params setters
    setQuantityProduct(count)
    {
        var countVal = parseInt(count);

        if(count > 0)
        {
            this.quantityProducts = countVal;
        }
        else
        {
            this.quantityProducts = 0;
        }
    }



    // summ bonuses getters
    getSummBonus()
    {
        return this.bonus;
    }

    getSummExtrabonus()
    {
        return this.extrabonus;
    }



    // calculated functions
    calculateBonus()
    {
        this.bonus = Number.parseFloat(this.quantityProducts * this.bonus).toFixed(2);
    }

    calculateExtrabonus()
    {
        this.extrabonus = Number.parseFloat(this.quantityProducts * this.extrabonus).toFixed(2);
    }
}



// Измененя областей
class Resizing {
    constructor() {
        //Tools
        this.Coord = {};
        this.Coord.Start = false;

        // resize button
        this.ResLR = document.querySelector('#resLRgm');
        this.ResTBaside = document.querySelector('#resTBgmAside');
        this.ResTBtable = document.querySelector('#resTBgmTable');

        //BOXES
        this.LeftContainer = this.ResLR.parentNode;
        this.LeftContainerTop = this.ResTBaside.previousElementSibling;
        this.LeftContainerBottom = this.ResTBaside.nextElementSibling;
        this.RightContainerTop = document.querySelector('#contTBgmTopTable');
        this.RightContainerBottom = document.querySelector('#contTBgmTable');
        this.HeaderTableToRightContainer = document.querySelector('.head-tab-box');

        //static resize boolean
        this.ResLRHid = false;
        this.ResTBasideHid = false;
        this.ResTBtableHid = false;
        this.ResBContainerHid = false;

        //dynamic resize boolean
        this.ResLRHidDynamic = false;
        this.ResTBasideHidDynamic = false;
        this.ResTBtableHidDynamic = false;

        // intializ Functions
        this.resizeWindow();
        this.Events();
    }

    resizeWindow() {
        var S = this;

        var top_panel = S.HeaderTableToRightContainer.clientHeight;
        var bx_panel = document.querySelector('#bx-panel-top');
        if (bx_panel)
            top_panel += bx_panel.clientHeight;

        S.RightContainerTop.style.height = S.RightContainerTop.clientHeight + (window.innerHeight - (S.RightContainerBottom.clientHeight + S.RightContainerTop.clientHeight)) - 140 - top_panel -30 + 'px';
        S.LeftContainerTop.firstElementChild.style.height = S.LeftContainerTop.firstElementChild.clientHeight + (window.innerHeight - (S.LeftContainerBottom.clientHeight + S.LeftContainerTop.firstElementChild.clientHeight)) - 15 - top_panel -30 + 'px';
    }

    Events() {
        var S = this;

        // Resize Window
        window.addEventListener('resize', function (e) {
            S.resizeWindow();
        });

        // Static Resize Events
        S.ResLR.firstElementChild.addEventListener('click', function (e) {
            if (S.ResLRHidDynamic) return;

            if (!S.ResTBasideHid)
                S.SPTopResTBaside = S.LeftContainerTop.firstElementChild.clientHeight;

            S.RightToLeftHid();
        });
        S.ResTBaside.firstElementChild.addEventListener('click', function (e) {
            if (S.ResTBasideHidDynamic) return;
            if (!S.ResTBasideHid) {
                S.SPTopResTBaside = S.LeftContainerTop.firstElementChild.clientHeight;
                S.SPBottomResTBaside = S.LeftContainerBottom.clientHeight;
            }
            S.TopToBottomAsideHid();
        });
        S.ResTBtable.firstElementChild.addEventListener('click', function (e) {
            if (S.ResTBtableHidDynamic) return;

            if (!S.ResTBtableHid) {
                S.SPTopResTBtable = S.RightContainerTop.clientHeight;
                S.SPBottomResTBtable = S.RightContainerBottom.clientHeight;
            }

            S.TopToBottomTableHid();

            S.ResTBtableHid = !S.ResTBtableHid;
        });

        // Dynamic Resize Events
        S.ResLR.addEventListener('mousedown', function (e) {
            S.StartPositin = S.LeftContainer.clientWidth;
            S.ResLRHidDynamic = true;
        });
        S.ResTBaside.addEventListener('mousedown', function (e) {
            S.SPTopResTBasideDynamic = S.LeftContainerTop.clientHeight;
            S.SPBottomResTBasideDynamic = S.LeftContainerBottom.clientHeight;
            S.ResTBasideHidDynamic = true;
        });
        S.ResTBtable.addEventListener('mousedown', function (e) {
            S.SPTopResTBtableDynamic = S.RightContainerTop.clientHeight;
            S.SPBottomResTBtableDynamic = S.RightContainerBottom.clientHeight;
            S.ResTBtableHidDynamic = true;
        });
        document.body.addEventListener('mousemove', function (e) {
            if (!S.ResLRHidDynamic && !S.ResTBasideHidDynamic && !S.ResTBtableHidDynamic) return;


            if (S.Coord.Start == false) {

                S.Coord.Start = true;
                S.Coord.StartX = e.pageX;
                S.Coord.StartY = e.pageY;

            }

            if (S.ResLRHidDynamic) {
                S.DoDragResLR(e);
            }
            else if (S.ResTBasideHidDynamic) {
                S.DoDragResTBaside(e);
            }
            else if (S.ResTBtableHidDynamic)
                S.DoDragResTBtable(e);

        });
        document.body.addEventListener('mouseup', function (e) {

            if (S.ResLRHidDynamic || S.ResTBasideHidDynamic || S.ResTBtableHidDynamic) {

                S.ResLRHidDynamic = false;
                S.ResTBasideHidDynamic = false;
                S.ResTBtableHidDynamic = false;
                S.Coord.Start = false;

            }

        });

        //ANIMATE
        S.LeftContainerTop.firstElementChild.addEventListener('transitionend', function (e) {

            if (S.ResTBasideHid)
                S.LeftContainerBottom.style.display = '';

            S.LeftContainerTop.firstElementChild.classList.remove('heightAnimate');

            S.ResTBasideHid = !S.ResTBasideHid;
        });
        S.RightContainerBottom.addEventListener('transitionend', function (e) {
            S.RightContainerTop.classList.remove('heightAnimate');
            S.RightContainerBottom.classList.remove('heightAnimate');
        });
        S.LeftContainer.addEventListener('transitionend', function (e) {
            S.LeftContainer.classList.remove('widthtAnimate');
        });

    }

    // Static Resize Function
    RightToLeftHid() {
        var S = this;


        if (!S.LeftContainer.classList.contains('widthtAnimate'))
            S.LeftContainer.classList.add('widthtAnimate');


        if (S.ResLRHid) {
            S.LeftContainerTop.style.width = '';
            S.LeftContainerTop.firstElementChild.style.height = S.LeftContainer.clientHeight + 'px';

            if (!S.ResBContainerHid)
                S.LeftContainerBottom.style.display = '';
            S.ResTBaside.style.display = '';
            S.LeftContainer.style.marginLeft = 0 + 'px';
            S.hidDynamicLine(true);
        }
        else {
            S.LeftContainerTop.style.width = '0px';
            S.LeftContainerTop.firstElementChild.style.height = S.LeftContainer.clientHeight - S.LeftContainerBottom.clientHeight;
            S.LeftContainerBottom.style.display = 'none';
            S.ResTBaside.style.display = 'none';

            var marg = 10;
            if (screen.width > 1525) {
                marg = 15;
            }

            S.LeftContainer.style.marginLeft = (-S.LeftContainer.clientWidth - marg) + 'px';
            S.hidDynamicLine(false);
        }

        S.ResLRHid = !S.ResLRHid;
    }

    TopToBottomAsideHid() {
        var S = this;

        S.LeftContainerTop.firstElementChild.classList.add('heightAnimate');


        if (S.ResTBasideHid) {
            S.LeftContainerBottom.style.height = S.SPBottomResTBaside + 'px';
            S.ResBContainerHid = false;
            S.LeftContainerTop.firstElementChild.style.height = S.SPTopResTBaside + 3 + 'px';
        }
        else {
            var newHeight = S.SPTopResTBaside + S.SPBottomResTBaside;

            S.LeftContainerTop.firstElementChild.style.height = newHeight + 'px';

            S.LeftContainerBottom.style.display = 'none';
            S.ResBContainerHid = true;
        }
    }

    TopToBottomTableHid() {
        var S = this;
        if (!S.RightContainerTop.classList.contains('heightAnimate')) {

            S.RightContainerTop.classList.add('heightAnimate');
            S.RightContainerBottom.classList.add('heightAnimate');
        }


        if (S.ResTBtableHid) {
            S.RightContainerTop.style.height = S.SPTopResTBtable + 'px';
            S.RightContainerBottom.style.height = S.SPBottomResTBtable + 'px';
        }
        else {
            var newHeight = S.RightContainerTop.clientHeight + S.RightContainerBottom.clientHeight;

            S.RightContainerTop.style.height = newHeight + 'px';
            S.RightContainerBottom.style.height = 0 + 'px';

        }
    }

    // Dynamic Resize Function
    DoDragResLR(e) {
        var S = this;

        if (S.ResLRHid) return;

        S.Coord.X = e.pageX;
        S.Coord.Y = e.pageY;

        S.clearSelection();
        S.LeftContainer.style.width = S.StartPositin + (S.Coord.X - S.Coord.StartX) + 'px';
    }

    DoDragResTBaside(e) {
        var S = this;
        S.clearSelection();

        S.Coord.X = e.pageX;
        S.Coord.Y = e.pageY;

        var newHeightTop = S.SPTopResTBasideDynamic + (S.Coord.Y - S.Coord.StartY);
        var newHeightBottom = S.SPBottomResTBasideDynamic + -(S.Coord.Y - S.Coord.StartY) + 2;

        if (newHeightTop < 10 || newHeightBottom < 200) return;

        S.LeftContainerTop.firstElementChild.style.height = newHeightTop + 'px';
        S.LeftContainerBottom.style.height = newHeightBottom + 'px';
    }

    DoDragResTBtable(e) {
        var S = this;


        S.Coord.X = e.pageX;
        S.Coord.Y = e.pageY;

        var newHeightTop = S.SPTopResTBtableDynamic + (S.Coord.Y - S.Coord.StartY);
        var newHeightBottom = S.SPBottomResTBtableDynamic + -(S.Coord.Y - S.Coord.StartY) - 29;
        var newHeightBottomTable = S.SPBottomResTBScrolltableDynamic + -(S.Coord.Y - S.Coord.StartY);

        if (newHeightTop < 0 || newHeightBottom < 60) return;

        S.clearSelection();
        S.RightContainerTop.style.height = newHeightTop + 'px';
        var acttabs = S.RightContainerBottom.querySelectorAll('.tab-body.gmcart');
        acttabs.forEach(function (item) {
            var scroll = item.querySelector('.scroll-box');
            scroll.style.height = newHeightBottom - 50 + 'px';
            item.style.height = newHeightBottom + 'px';
        });
    }

    hidDynamicLine(_case) {
        var S = this;
        if (!_case)
            S.ResLR.style.cursor = 'default';
        else S.ResLR.style.cursor = '';
    }

    clearSelection() {
        if (window.getSelection)
            window.getSelection().removeAllRanges();
        else
            document.selection.empty();
    }


}

// Работа таблици
class Table {
    constructor() {
        this.TBContainer = document.querySelector('#contTBgmTopTable'); // Контейнер с таблицей
        this.THContainer = document.querySelector('.head-tab-box');// Контейнер с Шапкой таблици

        this.TBody = this.TBContainer.querySelector('table');// Главная таблица
        this.THead = this.THContainer.querySelector('table');// Шапка таблици
        this.ColWidth = [];

        this.Resizers = document.querySelectorAll('em.resize'); // Ползунки ресайза таблици
        this.ResElement = false;
        this.Coord = {};
        this.RowsActive = false;
        this.SortActive = false;
        this.CanUped = true;
        this.Mobile = false;

        this.WidthNeed = document.querySelector('#contTBgmTopTable').clientWidth;

        this.TableStorage = (typeof(Storage) !== "undefined") ? true : false;

        this.searchInputNode = document.querySelector('input.inpsearchgm1');
        this.isSearchInputFocus = false;

        this.setTableWidth();

        if (screen.width < 1023) {
            this.Mobile = true;
            console.dir(screen.height);
            document.querySelector('.main-mobile .table-cat').style.height = screen.height - 80 + 'px';
        }


        this.Events();


    }

    Events() {
        var S = this;

        Array.prototype.forEach.call(S.Resizers, function (item) {
            item.addEventListener('mousedown', function (e) {
                if (!S.ResElement) S.ResElement = item;

                S.Coord.StartX = e.pageX;
                S.SWParent = S.ResElement.parentNode.clientWidth;
                S.SWTBody = S.TBody.clientWidth;
            });
        });


        window.addEventListener('resize', function (e) {
            if (S.Mobile)
                document.querySelector('.main-mobile .table-cat').style.height = screen.height - 80 + 'px';
        });

        if (S.searchInputNode instanceof Node && S.searchInputNode.nodeType === Node.ELEMENT_NODE)
        {
           S.searchInputNode.addEventListener('focus', function (event) {

               S.isSearchInputFocus = true;

           });

            S.searchInputNode.addEventListener('blur', function (event) {

                S.isSearchInputFocus = false;

            });
        }


        document.body.addEventListener('click', function (e) {
            var trAct = e.target.closest('tr th');
            if (trAct) {
                if (trAct.querySelector('span')) {
                    var span = trAct.querySelector('span');

                    // if (!S.SortActive) {
                    //    S.SortActive = trAct;
                    //    span.classList.add('arr-up');
                    // }else{
                    if (span.classList.contains('arr-up')) {
                        span.classList.add('arr-down');
                        span.classList.remove('arr-up');
                    } else if (span.classList.contains('arr-down')) {
                        span.classList.add('arr-up');
                        span.classList.remove('arr-down');
                    } else span.classList.add('arr-up');
                    //}
                }
            }
        });

        document.body.addEventListener('mousemove', function (e) {
            if (!S.ResElement) return;

            S.clearSelection();

            S.Coord.X = e.pageX;

            var newWidth = S.SWParent + (S.Coord.X - S.Coord.StartX);

            if (newWidth < 11) return;

            S.ResElement.parentNode.style.width = newWidth + 'px';
            S.setColWidth(S.ResElement.parentNode);
            S.TBody.querySelector('.' + S.ResElement.parentNode.classList[0]).style.width = newWidth + 'px';


            S.TBody.style.width = S.SWTBody + (S.Coord.X - S.Coord.StartX) + 'px';
            S.THead.style.width = S.SWTBody + (S.Coord.X - S.Coord.StartX) + 'px';

        });

        document.body.addEventListener('mouseup', function (e) {
            S.ResElement = false;
        });

        S.TBContainer.addEventListener('scroll', function (e) {
            S.THContainer.style.marginLeft = -S.TBContainer.scrollLeft + 'px';
        });

        document.body.addEventListener('click', function (e) {
            if (S.Mobile) return;
            if (e.target.nodeName == 'TH' || e.target.closest('TH'))return;
            if (e.target.closest('tr')) {
                if (S.RowsActive)
                    S.RowsActive.classList.remove('color-yell');

                S.RowsActive = e.target.closest('tr');
                S.RowsActive.classList.add('color-yell');
                if (e.target.closest('#contTBgmTopTable'))
                    S.scrollTable();
            }
        });

        //var trigger_search;
        document.body.addEventListener('keydown', function (e) {
            var NewElementActive = false;

            var searchPlaceholderEw = document.querySelector('.srs__select');

            if (searchPlaceholderEw !== null && !searchPlaceholderEw.classList.contains('disabled'))
            {
                return;
            }

            if (S.isSearchInputFocus === true)
            {
                return false;
            }

            if (e.keyCode == 13/* Enter */) {
                // call function filter
                if (e.target.hasAttribute('data-name')) {
                    filterByFields({NUMBER_PAGE: 1, ORDER_BY: 'id', ORDER: 'asc'});
                }
            }

            if (!S.RowsActive) {

                if (!S.CanUped) return;

                if (e.keyCode == 38/* ArrowUp */ || e.keyCode == 40/* ArrowDown */)
                    NewElementActive = S.TBody.firstElementChild.firstElementChild;
                if (e.keyCode == 13/* Enter */) {
                    var search_inp = document.querySelector('.main-mobile input.inpsearchgm').value;

                    if (S.Mobile) {
                        $.ajax({
                            url: '/local/ajax/mobile_catalog.php',
                            type: 'post',
                            data: {
                                mobile_search: search_inp
                            },
                            success: function (data) {
                                $('.table-cat tbody tr').remove();
                                $('.table-cat tbody').append(data);
                            },
                            error: function (error) {
                                console.log(error);
                            }

                        });
                    }
                    //console.log(trigger);
                    /*trigger_search &&*/
                    // document.querySelector('.search_button').dispatchEvent(new Event('click', {
                    //     bubbles: true,
                    //     cancelable: true
                    // }));

                    //     e.target.blur();
                    // return;
                }
            } else {

                if(!window.wmc.DetailPopContainer.isOpenPoup)
                {

                    if (S.CanUped) {
                        if (e.keyCode == 38 /* ArrowUp */) {

                            e.preventDefault();
                            if (S.RowsActive.previousElementSibling != null) {
                                var NewElementActTMP = S.RowsActive.previousElementSibling;

                                //----------Удалить в случае надобности -------------//
                                if (NewElementActTMP.nodeName != 'TR')
                                    NewElementActTMP = NewElementActTMP.previousElementSibling;
                                //---------------------------------------------------//

                                NewElementActive = NewElementActTMP;
                            }


                        } else if (e.keyCode == 40 /* ArrowDown */) {
                            e.preventDefault();
                            if (S.RowsActive.nextElementSibling != null) {
                                var NewElementActTMP = S.RowsActive.nextElementSibling;

                                //----------Удалить в случае надобности -------------//
                                if (NewElementActTMP.nodeName != 'TR')
                                    NewElementActTMP = NewElementActTMP.nextElementSibling;
                                //---------------------------------------------------//

                                NewElementActive = NewElementActTMP;
                            }

                            //// подгрузка доп. позиций


                        } else if (e.keyCode == 13/* Enter */) {
                            if (!e.target.classList.contains('filter')) {
                                S.RowsActive.dispatchEvent(new Event('dblclick', {bubbles: true, cancelable: true}));
                                S.CanUped = false;
                                return;
                            } else {
                                e.target.dispatchEvent(new Event('blur', {bubbles: true, cancelable: true}));
                            }
                        }
                    }
                    if (e.keyCode == 27 /* Esc */) {

                        if (S.CanUped) {
                            if (S.RowsActive)
                                S.RowsActive.classList.remove('color-yell');
                            S.RowsActive = false;
                            return;
                        } else {
                            document.querySelector('.cancelgmButton').dispatchEvent(new Event('click', {
                                bubbles: true,
                                cancelable: true
                            }));
                            S.CanUped = true;
                        }
                    }
                }
                else
                {
                    if(e.keyCode == 27)
                    {
                        if (S.CanUped) {
                            if (S.RowsActive)
                                S.RowsActive.classList.remove('color-yell');
                            S.RowsActive = false;
                            return;
                        } else {
                            document.querySelector('.cancelgmButton').dispatchEvent(new Event('click', {
                                bubbles: true,
                                cancelable: true
                            }));
                            S.CanUped = true;
                        }
                    }
                    else if(e.keyCode == 13)
                    {
                        e.preventDefault();
                        return false;
                    }
                }
            }

            if (NewElementActive) {
                if (S.RowsActive)
                    S.RowsActive.classList.remove('color-yell');
                S.RowsActive = NewElementActive;
                S.RowsActive.classList.add('color-yell');

                S.scrollTable();
            }

        });
    }

    setTableWidth(){
        var S = this;


        this.setColWidth();


        if(S.TableStorage && localStorage.TableStorage) {

            this.setColWidth();

            var res = 0;
            for (var i = 0; i < S.ColWidth.length; i++) {
                res += S.ColWidth[i];
            }

            this.TBody.style.width = res + 'px';
            this.THead.style.width = res + 'px';
        } else {
            this.TBody.style.width = S.WidthNeed + 'px';
            this.THead.style.width = S.WidthNeed + 'px';
        }

        $('.catalog-container').css('opacity','1');

    }

    setColWidth() {
        try {
            var S = this;
            /* console.log(S.ColWidth);*/

            if (S.TableStorage) {
                if (localStorage.TableStorage)
                    S.ColWidth = JSON.parse(localStorage.getItem('TableStorage'));
            }

            0 != S.ColWidth.length && (function () {
                !arguments[0] && (function () {
                    //При аяксах перезапись столбцов
                    for (var key = 0; key < S.ColWidth.length; key++) {

                        $(S.TBody).find('.col_' + (key + 1)).css('width', S.ColWidth[key]);
                        $(S.THead).find('.col_' + (key + 1)).css('width', S.ColWidth[key]);
                    }
                }()) || arguments[0] && (function (element) {
                    // При изменении ширины столбца
                    S.ColWidth[+element.classList[0].slice(4) - 1] = element.offsetWidth;

                })(arguments[0]);
            }(arguments[0])) || 0 == S.ColWidth.length && (function () {
                //Запись значений
                var trH = S.THead.querySelector('TR');
                for (var i = 0; i < trH.children.length; i++) {

                    0 != trH.children[i].classList.length && (function (item) {

                        S.ColWidth.push(item.offsetWidth);

                    }(trH.children[i]));
                }
            }());

            !!S.TableStorage && (function () {
                localStorage.setItem('TableStorage', JSON.stringify(S.ColWidth));
            })(arguments[0]);

        } catch (e) {
            console.log(e);
        }
    }


    getStyle(elem) {
        return window.getComputedStyle ? getComputedStyle(elem, "") : elem.currentStyle;
    }

    scrollTable() {
        var S = this;

        var contHeight = S.TBContainer.clientHeight,
            elementTop = S.RowsActive.offsetTop,
            elementHeight = S.RowsActive.clientHeight,
            howToscreen = (contHeight + S.TBContainer.scrollTop) - elementTop;

        //console.dir('contHeight = '+ contHeight + ' elementTop = ' + elementTop + ' howToscreen = ' + howToscreen + ' Scroll = ' + S.TBContainer.scrollTop);
        if (howToscreen < elementHeight) {
            //console.dir('howOffscreen = ' + (+elementHeight - +howToscreen));
            if (howToscreen < 0)
                S.TBContainer.scrollTop += elementHeight;
            else
                S.TBContainer.scrollTop += elementHeight - howToscreen;
        }
        else if (elementTop < S.TBContainer.scrollTop) {
            S.TBContainer.scrollTop -= S.TBContainer.scrollTop - elementTop;
        }

        //console.dir('contHeight = '+ contHeight + ' elementTop = ' + elementTop + ' howToscreen = ' + howToscreen + ' Scroll = ' + S.TBContainer.scrollTop);
    }

    clearSelection() {
        if (window.getSelection)
            window.getSelection().removeAllRanges();
        else
            document.selection.empty();
    }
}

//Табы
class Tab {
    constructor() {
        this.Carts = {
            buttons: false,
            container: false,
            key: false
        };
        this.Info = {
            buttons: false,
            container: false,
            key: false
        };

        this.InitTabsAll();
        this.Events();


    }

    Events() {
        var S = this;
        var arCart = this.Carts.buttons;
        var arInfo = this.Info.buttons;

        Array.prototype.forEach.call(arCart, function (item, key, arCart) {
            item.addEventListener('click', function (e) {
                S.Carts.key = key;
                S.togleCartTabs(item);
            });
        });

        Array.prototype.forEach.call(arInfo, function (item, key, arInfo) {
            item.addEventListener('click', function (e) {
                S.Info.key = key;
                S.togleInfoTabs(item);
            });
        });


    }

    InitTabsAll() {

        var tabs = document.querySelectorAll('.tabcart');
        var inf = document.querySelectorAll('.tabinfo');

        var cartBody = document.querySelectorAll('.gmcart');
        var infoBody = document.querySelectorAll('.gminfo');

        this.Carts.buttons = tabs;
        this.Info.buttons = inf;

        this.Carts.container = cartBody;
        this.Info.container = infoBody;


    }

    togleCartTabs(item) {
        Array.prototype.forEach.call(this.Carts.buttons, function (it) {
            if (!item.classList.contains('inftabM'))
                it.classList.remove('active');

            if (item.classList.contains('inftabM') && it.classList.contains('visible'))
                it.classList.add('active');

            it.classList.remove('visible');

        });

        item.classList.add('visible');

        this.showTabBody('cart');
    }

    togleInfoTabs(item) {
        var S = this;
        var arr = S.Info.buttons;

        Array.prototype.forEach.call(arr, function (it, key, arr) {
            it.classList.remove('active');
            it.classList.remove('visible');

        });

        item.classList.add('active');
        item.classList.add('visible');

        this.showTabBody('info');

    }

    showTabBody(_case) {
        var S = this;
        var Arr = (_case == 'cart') ? S.Carts.container : S.Info.container;
        var key = (_case == 'cart') ? S.Carts.key : S.Info.key;

        Array.prototype.forEach.call(Arr, function (item) {
            item.classList.remove('active');
        });


        Arr[key].classList.add('active');
        var elementsBasket = Arr[key].querySelectorAll('[data-order] tbody tr');

        if (elementsBasket.length > 0) {
            var basketSumm = 0;
            Array.prototype.forEach.call(elementsBasket, function (item) {
                basketSumm += parseFloat(item.getAttribute('data-price'))*parseFloat(item.getAttribute('data-quantity_good'));
            });

            // var displaySummcontainer = Arr[key].querySelector('.total_price_sum');

            // if (displaySummcontainer !== null) {
            //     displaySummcontainer.innerHTML = basketSumm.toFixed(2); //Math.ceil(basketSumm);
            // }
        }
    }
}

// Отображение ПопАпов
class Viewer {
    constructor() {
        //Buttons
        this.historyButton = document.querySelector('.historyGmButton');
        this.HistoryContent = document.querySelector('.drop-history.deskgmhist');
        this.OpenHistoryPop = false;
        this.DropNameButton = document.querySelector('.dropname');
        this.Message = {
            OrderMakeTrue: 'Заказ успешно создан!',
            isDeleteCart: 'Вы действительно хотите удалить заказ?',
            isDeleteItemCart: 'Вы действительно хотите удалить товар из корзины?',
            DeleteCartTrue: 'Заказ удален!',
            DeleteCartFalse: 'Ошибка удаления!',
            DeleteItemCartFalse: 'Ошибка удаления товара',
            DeleteItemCartTrue: 'Товар удален!'
        };
        this.MessageCheck = false;
        this.EventVariable = false;

        this.table = new Table();

        //PoupContainers
        this.PerPopContainer = document.querySelector('#dropPersCont');
        this.PerPopContainer.isOpenPopUp = false;

        this.OstPopContainer = document.querySelector('#dropOstCont');
        this.OstPopContainer.isOpenPopUp = false;

        this.QuePopContainer = document.querySelector('#dropQuestionCont');
        this.QuePopContainer.isOpenPopUp = false;

        this.DropNamePop = this.DropNameButton.parentNode.nextElementSibling;
        this.DropNamePop.isOpenPoup = false;

        this.OrdersListPopUpContainer = document.querySelector('#zakaz');
        this.OrdersListPopUpContainer.isOpen = false;

        this.AnalogPopContainer = document.querySelector('#popup-analogs');
        this.AnalogPopContainer.isOpenPoup = false;

        this.PhotoPopContainer = document.querySelector('#popup-foto');
        this.PhotoPopContainer.isOpenPoup = false;

        this.cumulativePresentProductPopup = document.querySelector('#popup-cumulative-product-present');
        this.cumulativePresentProductPopup.isOpenPopup = false;

        this.presentProductPopup = document.querySelector('#popup-product-present');
        this.presentProductPopup.isOpenPoup = false;

        this.DetailPopContainer = document.querySelector('#popup-product');
        this.DetailPopContainer.isOpenPoup = false;

        this.NoticePopContainer = document.querySelector('.popup-confirmation');
        this.NoticePopContainer.isOpenPoup = false;

        this.NoticeQuestionPopContainer = document.querySelector('.popup-confirmation');
        this.NoticeQuestionPopContainer.isOpenPoup = false;

        this.Mobile = (screen.width < 1023) ? true : false;

        this.revisionOrderUpdate = false;

        //InitFunction
        this.Events();
    }

    Events() {
        var S = this;

        if (S.Mobile) {
            $('#check1')[0].checked = false;
            S.DetailPopContainer.querySelector('.img-box img').style.display = 'none';
            $('#check1').trigger('refresh');
        }

        $('#check1').on('change.styler', function (e) {
            if (!e.target.checked) {
                S.DetailPopContainer.querySelector('.img-box img').style.display = 'none';
                localStorage.removeItem('CheckStorage');
            } else {
                S.DetailPopContainer.querySelector('.img-box img').style.display = '';
                localStorage.setItem('CheckStorage', 1);
            }
        });

            if (localStorage.getItem('CheckStorage') != null){
                S.DetailPopContainer.querySelector('.img-box img').style.display = '';
                $('#check1-styler').addClass('checked');
            }else{
                S.DetailPopContainer.querySelector('.img-box img').style.display = 'none';
            }

        //S.isfRtrigger = false; // для того чтобы товар не добавлялся в заказ по первоку ентеру(а только по второну на самом попапе);

        document.body.addEventListener('keydown', function (e) {

            //console.dir('E.TARGET- ',e.target);

            if (!S.DetailPopContainer.isOpenPoup) return;

            if (!$(S.DetailPopContainer.querySelector('input[type="number"]'))[0].focused)
                setTimeout(function () {
                    $(S.DetailPopContainer.querySelector('input[type="number"]')).focus()
                }, 10);

            if (e.keyCode == 38 /* ArrowUp */) {
                // $(S.DetailPopContainer.querySelector('.plus')).trigger('mousedown');
                $(S.DetailPopContainer.querySelector('.plus')).trigger('mouseup');
                if (e.target.value > +e.target.getAttribute('data-q')) {
                    //document.querySelector('.count_order_mnoga').innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки. Недостающее количество будет зарезервировано и поставлено в течение 14 дней. Возможно изменение стоимости в связи с изменением цены поступления.";

                    var productsCountDescr = document.querySelector('.count_order_mnoga');

                    if (productsCountDescr !== null && productsCountDescr !== undefined)
                    {
                        if (productsCountDescr.hasAttribute('data-admission'))
                        {
                            if (productsCountDescr.dataset.admission !== '')
                            {
                                productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки. Ориентировочная дата нового поступления – " + productsCountDescr.dataset.admission + " Возможно, изменение стоимости нового поступления.";
                            }
                            else
                            {
                                productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки.";
                            }
                        }
                        else
                        {
                            productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки.";
                        }
                    }
                }
            } else if (e.keyCode == 40 /* ArrowDown */) {
                //$(S.DetailPopContainer.querySelector('.minus')).trigger('mousedown');
                $(S.DetailPopContainer.querySelector('.minus')).trigger('mouseup');
                document.querySelector('#count_good').removeAttribute('disabled');
            } else if (e.keyCode == 13) {

                S.isfRtrigger = true;

                /*if(e.target.classList.contains('filter')) return;*/
                if (!S.DetailPopContainer.isOpenPoup) return;
                //   console.log(trigger);
                S.isfRtrigger && document.querySelector('#popup-product .add_button').dispatchEvent(new Event('click', {
                    bubbles: true,
                    cancelable: true
                }));

                S.isfRtrigger = true;

            } else if (e.keyCode != 38 || e.keyCode != 40) {}


        });

        document.body.addEventListener('click', function (e) {

            // отмена (закрытие) попапа из списка заказов
            if(e.target.classList.value === 'btn cancelgmButton' && S.revisionOrderUpdate === true) {
                $(".popup.popup-item-delete").hide();
            }

            //закрытие попапа из списка заказов
            if(e.target.classList.value === 'close-inp' && S.revisionOrderUpdate === true) {
                $(".popup.popup-item-delete").hide();
            }

            // удаление товара из списка заказов
            if(e.target.classList.value === 'btn delgmTrue' && S.revisionOrderUpdate === true) {

                $(".popup.popup-item-delete").hide().removeClass("orderPopupAction");

                var orderId = (e.target.dataset.orderId) ? e.target.dataset.orderId : false;
                var basketId = (e.target.dataset.basketId) ? e.target.dataset.basketId : false;

                $.ajax({
                    type: 'post',
                    url: "/local/ajax/catalog.php",
                    data: {
                        id: basketId,
                        orderId: orderId
                    },
                    success: function (data) {
                        S.openNoticePopUp(S.Message['DeleteItemCartTrue']);
                        $('body').on('click', '.close-inp', function () {
                            location.href = '/catalog/'
                        });
                        setTimeout(function () {
                            location.href = '/';
                        }, 1000);
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });

            }


            if (e.target.closest('tr') && S.Mobile) {
                var item = e.target.closest('tr');
                if (item) {
                    S.openDetailPopUp(item);
                    return;
                }
            }

            if ((e.target.classList.contains('buttom-mob') && S.Mobile) || (e.target.classList.contains('tell-btn') && !S.Mobile)) {

                // S.openNoticePopUp(S.Message['OrderMakeTrue']);
                if (screen.width > 1024) {
                    $('.order').each(function () {
                        if ($(this).hasClass('visible') || $(this).hasClass('active')) {
                            var order_id = $(this).data('id');
                            location.href = "/personal/order/?ORDER_ID=" + order_id;
                        }
                    });
                    return;
                } else {
                    $('.zakaz-list .row-line').each(function () {
                        if ($(this).hasClass('active')) {
                            var order_id = $(this).data('id');
                            location.href = "/personal/order/?ORDER_ID=" + order_id;
                        }
                    });
                }
            }
            if ((!e.target.closest('.popup-confirmation .popup-box') || e.target.closest('.popup-confirmation .close-inp')) && S.NoticePopContainer.isOpenPoup) {
                S.openNoticePopUp(S.Message[0]);
                return;
            }

            if (!e.target.closest('.deskgmhist') && !e.target.closest('.historyGmButton')) {
                S.HistoryContent.style.display = 'none';
                S.OpenHistoryPop = false;
            }

            /*if (!e.target.closest('.dropname') && !e.target.closest('.' + S.DropNamePop.classList.value)) {
             if (S.DropNamePop.style.display == 'block') {
             S.openDropNamePopUp();
             }
             }*/

            if (e.target.classList.contains('click-zakaz') && !S.OrdersListPopUpContainer.isOpen) {
                S.OpenPopUpOrdersList();
                return;
            }
            if ((!e.target.closest('.popup-box') || e.target.classList.contains('close-inp') || e.target.closest('.row')) && S.OrdersListPopUpContainer.isOpen) {
                if (e.target.closest('.row'))
                    document.querySelector('.click-zakaz').innerText = e.target.closest('.row').lastElementChild.innerText;
                S.OpenPopUpOrdersList();
            }

            if (e.target.closest('.ic-going')) {
                S.openAnalogPopUp(e.target);
            } else if ((!e.target.closest('.popup-box .table-cat') || e.target.closest('.popup-box .close-inp')) && S.AnalogPopContainer.isOpenPoup) {
                S.openAnalogPopUp(0);
            }

            if (e.target.closest('span.ic-foto') || e.target.closest('.cat-img')) {
                S.openDetailPhotoPopUp(e.target);
            } else if ((!e.target.closest('#popup-foto .popup-box ') || e.target.closest('.popup-box .close-inp')) && S.PhotoPopContainer.isOpenPoup) {
                S.openDetailPhotoPopUp(0);
            }


            if ((!e.target.closest('#popup-product .popup-box') || e.target.closest('.popup-box .close-inp')) && S.DetailPopContainer.isOpenPoup) {
                S.openDetailPopUp(0);
                /// popup close

            }

            if (e.target.closest('#popup-product-present .close-inp') && S.presentProductPopup.isOpenPoup == true) {
                S.closePresentProductPopup();
            }

            if (e.target.closest('#popup-cumulative-product-present .close-inp') && S.cumulativePresentProductPopup.isOpenPoup == true) {
                S.closeCumulativePresentPopup();
            }

            /* даление заказа*/
            if (e.target.classList.contains('close-inp')) {
                // console.log(e.target.parentNode);
                S.EventVariable = e.target.parentNode.getAttribute('data-id');
                S.EventVariableItem = e.target.parentNode.getAttribute('data-orderID');
                if (e.target.closest('.tabcart')) {
                    S.openNoticeQuestionPopUp(1, 'isDeleteCart');
                }

                if (e.target.closest('.tab-tabl')) {
                    S.openNoticeQuestionPopUp(1, 'isDeleteItemCart');
                    S.MessageCheck = 'DeleteItemCartTrue';
                }
                return;
            }
            if (!e.target.closest('.popup-confirmation .popup-box') && S.NoticeQuestionPopContainer.isOpenPoup) {
                S.openNoticeQuestionPopUp(0, 0);
                return;
            }

            if ((e.target.classList.contains('cancelgmButton') || e.target.closest('.popup-confirmation .close-inp')) && S.NoticeQuestionPopContainer.isOpenPoup) {
                S.openNoticeQuestionPopUp(0, 0);
                return;
            }

            if (e.target.classList.contains('delgmTrue') && S.NoticeQuestionPopContainer.isOpenPoup) {
                S.openNoticeQuestionPopUp(0, S.Message['DeleteCartTrue']);

                if (S.MessageCheck == 'DeleteItemCartTrue') {
                    $(function () {
                        var id = ( S.EventVariable) ? S.EventVariable : false;
                        var order_ID = (S.EventVariableItem) ? S.EventVariableItem : false;
                        //console.log(order_ID); return;
                        $.ajax({
                            type: 'post',
                            url: "/local/ajax/catalog.php",
                            data: {
                                id: id,
                                orderId: order_ID
                            },
                            success: function (data) {
                                S.openNoticePopUp(S.Message['DeleteItemCartTrue']);
                                $('body').on('click', '.close-inp', function () {
                                    location.href = '/catalog/'
                                });
                                setTimeout(function () {
                                    location.href = '/';
                                }, 1000);
                            },
                            error: function (error) {
                                console.log(error);
                            }
                        });
                    });
                }
                else {
                    $(function () {
                        var order_id = ( S.EventVariable) ? S.EventVariable : false;

                        $.ajax({
                            type: 'post',
                            url: "/local/ajax/catalog.php",
                            data: {
                                order_id: order_id
                            },
                            success: function (data) {
                                // console.log(data);
                                if (data == 1) {
                                    S.openNoticePopUp(S.Message['DeleteCartTrue']);
                                    $('body').on('click', '.close-inp', function () {
                                        location.href = '/catalog/'
                                    });
                                    setTimeout(function () {
                                        location.href = '/';
                                    }, 1000);
                                } else {
                                    S.openNoticePopUp(S.Message['DeleteCartFalse']);
                                }

                            },
                            error: function (error) {
                                console.log(error);
                            }
                        });
                    });
                }
            }
            /*---------------------*/

            if (e.target.closest('span.pers')) {
                S.SCX = e.pageY;
                S.openPersentPopUp(e.target);
            } else if (!e.target.closest('#dropPersCont')) {
                S.openPersentPopUp(0);
            }

            if(e.target.closest('.col_7')){
                S.SCX = e.pageY;
                S.openOstPopUp(e.target);
            }else if (!e.target.closest('#dropOstCont')) {
                S.openOstPopUp(0);
            }

            if (e.target.closest('span.question')) {
                S.SCX = e.pageY;
                S.openQuestionPopUp(e.target);
            } else if (!e.target.closest('#dropQuestionCont')) {
                S.openQuestionPopUp(0);
            }

            if (e.target.classList.contains('cancelgmButton') && S.DetailPopContainer.isOpenPoup) {
                S.openDetailPopUp(0);
            }
        });
        document.body.addEventListener('dblclick', function (e) {
            // if(e.target.closest('thead tr')) return;
            var item = e.target.closest('tr'),
                param = false;


            if (item) {

                if(item.closest('table').className == 'tab-tabl bord gooDs')
                {
                    if(item.closest('table').matches('table[class$="tab-tabl bord gooDs"]'))
                    {
                        param = 'order';
                    }
                }

                if (item.dataset.present !== 'Y')
                {
                    setTimeout(function () {
                        S.openDetailPopUp(item, param);
                    }, 250);
                    setTimeout(function () {
                        $(S.DetailPopContainer.querySelector('input[type="number"]')).focus()
                    }, 10);
                }
            }


        });

        document.querySelector('#contTBgmTopTable').addEventListener('scroll', function (e) {

            if (S.PerPopContainer.isOpenPopUp)
                S.openPersentPopUp(0);
        });


        /*  S.DropNameButton.addEventListener('click', function (e) {
         S.openDropNamePopUp();
         });*/
        S.historyButton.addEventListener('click', function (e) {
            e.preventDefault();

            if (S.OpenHistoryPop)
                S.HistoryContent.style.display = 'none';
            else S.HistoryContent.style.display = 'block';

            S.OpenHistoryPop = !S.OpenHistoryPop;

        });
        S.HistoryContent.addEventListener('click', function (e) {
            var str = e.target.innerText;

            document.querySelector('.inpsearchgm1').value = str;
            S.HistoryContent.style.display = 'none';
            S.OpenHistoryPop = false;

            $('.search_button').click();
        });


        // событие клика на иконку подарка
        document.body.addEventListener('click', function (e) {

            if (e.target.nodeName == 'SPAN' && e.target.className == 'present-icon')
            {
                S.openPresentProductPopup(e.target);
            }

            if(e.target.parentNode.nodeName == 'SPAN' && e.target.parentNode.className == 'present-icon')
            {
                S.openPresentProductPopup(e.target.parentNode);
            }

            if(e.target.parentNode.parentNode.nodeName == 'SPAN' && e.target.parentNode.parentNode.className == 'present-icon')
            {
                S.openPresentProductPopup(e.target.parentNode.parentNode);
            }

            if(e.target.parentNode.parentNode.parentNode.nodeName == 'SPAN' && e.target.parentNode.parentNode.parentNode.className == 'present-icon')
            {
                S.openPresentProductPopup(e.target.parentNode.parentNode.parentNode);
            }

        });


    }

    //PopUp`s
    openNoticePopUp(message) {
        var S = this;
        if (!S.NoticePopContainer.isOpenPoup) {
            S.NoticePopContainer.querySelector('.btn-box').style.display = 'none';
            S.NoticePopContainer.querySelector('.conf-text').innerText = message;

            S.NoticePopContainer.style.display = 'block';
        }
        else {
            S.NoticePopContainer.querySelector('.btn-box').style.display = 'block';
            S.NoticePopContainer.style.display = 'none';
        }

        S.NoticePopContainer.isOpenPoup = !S.NoticePopContainer.isOpenPoup;
    }

    openNoticeQuestionPopUp(item, message) {
        var S = this;

        if (item != 0) {
            S.NoticeQuestionPopContainer.isOpenPoup = true;
            S.NoticeQuestionPopContainer.querySelector('.conf-text').innerHTML = S.Message[message];
            S.NoticeQuestionPopContainer.querySelector('.btn-box').style.display = 'block';
            S.NoticeQuestionPopContainer.style.display = 'block';
            S.ItemToDelet = item;
        }
        else {
            S.NoticeQuestionPopContainer.isOpenPoup = false;
            S.NoticeQuestionPopContainer.style.display = 'none';
            S.ItemToDelet = false;
        }
    }

    OpenPopUpOrdersList() {
        var S = this;

        if (!S.OrdersListPopUpContainer.isOpen) {
            S.OrdersListPopUpContainer.style.display = 'block';
            S.OrdersListPopUpContainer.isOpen = true;
        } else {
            S.OrdersListPopUpContainer.style.display = 'none';
            S.OrdersListPopUpContainer.isOpen = false;
        }
    }
    openOstPopUp(item){
        var S = this;

        if (item != 0) {
            item = $(item).closest('.col_7')[0];
            var newCoord = item.getBoundingClientRect();
            var newTop = newCoord.top;
            var bx_panel = document.querySelector('#bx-panel-top');
            if (bx_panel) {
                newTop = newCoord.top - bx_panel.clientHeight;
            }

            S.OstPopContainer.isOpenPopUp = true;

            //data-admission
            var str = 'Планируемая дата поступления: ' + $(item).attr('data-admission');
            S.OstPopContainer.innerHTML = str;

            S.OstPopContainer.style.display = 'block';

            S.OstPopContainer.style.left = newCoord.left - (S.OstPopContainer.clientWidth) + 'px';
            S.OstPopContainer.style.top = (newTop + item.clientHeight / 2) + 'px';

            console.log('T - ',newTop,'H - ',item.clientHeight);

        }
        else {
            S.OstPopContainer.isOpenPopUp = true;
            S.OstPopContainer.style.display = 'none';
        }
    }
    openPersentPopUp(item) {
        var S = this;

        if (item != 0) {
            var newCoord = item.getBoundingClientRect();
            var newTop = newCoord.top;
            var bx_panel = document.querySelector('#bx-panel-top');
            if (bx_panel) {
                newTop = newCoord.top - bx_panel.clientHeight;
            }

            S.PerPopContainer.isOpenPopUp = true;

            S.PerPopContainer.innerHTML = item.nextElementSibling.innerHTML;

            S.PerPopContainer.style.display = 'block';

            S.PerPopContainer.style.left = newCoord.left - (S.PerPopContainer.clientWidth) + 'px';
            S.PerPopContainer.style.top = newTop + (item.clientHeight / 2) + 'px';

        }
        else {
            S.PerPopContainer.isOpenPopUp = true;
            S.PerPopContainer.style.display = 'none';
        }
    }

    openQuestionPopUp(item) {
        var S = this;

        if (item != 0) {
            var newCoord = item.getBoundingClientRect();
            S.QuePopContainer.isOpenPopUp = true;

            S.QuePopContainer.innerHTML = 'Подсказка';

            S.QuePopContainer.style.display = 'block';

            S.QuePopContainer.style.left = newCoord.left - (S.QuePopContainer.clientWidth / 2) + 'px';
            S.QuePopContainer.style.top = newCoord.top + (item.clientHeight / 2) + 'px';

        }
        else {
            S.QuePopContainer.isOpenPopUp = true;
            S.QuePopContainer.style.display = 'none';
        }
    }

    openDropNamePopUp() {
        var S = this;

        if (!S.DropNamePop.isOpenPoup) {
            S.DropNamePop.style.display = 'block';
        }
        else {
            S.DropNamePop.style.display = 'none';
        }

        S.DropNamePop.isOpenPoup = !S.DropNamePop.isOpenPoup;
    }

    openAnalogPopUp(item) {
        var S = this;

        if (!S.AnalogPopContainer.isOpenPoup) {
            S.AnalogPopContainer.style.display = 'block';
        }
        else {
            S.AnalogPopContainer.style.display = 'none';
        }

        S.AnalogPopContainer.isOpenPoup = !S.AnalogPopContainer.isOpenPoup;

    }

    openDetailPhotoPopUp(item) {
        var S = this;
        var title = $(item).attr("title");

        if (item != 0) {
            S.PhotoPopContainer.isOpenPoup = true;
            S.PhotoPopContainer.style.display = 'block';
            $(".popup-foto-title").text(title);
        } else {
            S.PhotoPopContainer.isOpenPoup = false;
            S.PhotoPopContainer.style.display = 'none';
        }
    }

    openDetailPopUp(item, param = false) {

        var S = this;
        // S.ElementActiveMy = item.dataset.id;
        if (screen.width < 767 && screen.height < 600)
            S.DetailPopContainer.querySelector('.bx').style.height = screen.height - 40 + 'px';
        if (!S.DetailPopContainer.triggerInput) {
            setTimeout(function () {
                $(S.DetailPopContainer.querySelector('input[type="number"]')).select()
            }, 10);
            S.DetailPopContainer.triggerInput = true;
        }

        // очистим временный обьект
        Temp.removeItemProduct();

        //console.log(item);

        if (item != 0) {

            var catalogCodeEl, catalogCode;

            if ((catalogCodeEl = item.querySelector('.col_3')) !== null) {
                catalogCode = catalogCodeEl.innerText;
            } else {
                catalogCodeEl = document.querySelector('.tovar.getProp[data-id = "'+$(item).attr('data-id')+'"] .col_3');

                if (catalogCodeEl !== null) {
                    catalogCode = catalogCodeEl.innerText;
                } else {
                    catalogCode = $(item).attr("data-article");
                }
            }
            // сохраним в временный оюьект для использования
            Temp.setItemProduct(item);

            var bonus = Number.parseFloat(item.dataset.bonus),
                extrabonus = Number.parseFloat(item.dataset.extrabonus);



            var dataAdmision = item.querySelector('td[data-admission]');

            if (dataAdmision !== null && dataAdmision !== undefined)
            {
                if (dataAdmision.hasAttribute('data-admission'))
                {
                    if (dataAdmision.dataset.admission !== '' && dataAdmision.dataset.admission !== 'не указана')
                    {
                        document.querySelector('.count_order_mnoga').setAttribute('data-admission', dataAdmision.dataset.admission);
                    }
                    else
                    {
                        document.querySelector('.count_order_mnoga').setAttribute('data-admission', '');
                    }
                }
                else
                {
                    document.querySelector('.count_order_mnoga').setAttribute('data-admission', '');
                }
            }
            else
            {
                if (item.offsetParent !== undefined && item.offsetParent !== null)
                {
                    if (item.offsetParent.className === 'tab-tabl bord gooDs')
                    {
                        var loadItem = item.offsetParent.querySelector('tr[data-id="'+ item.dataset.id +'"] span[data-admission]');

                        if (loadItem !== null && loadItem !== undefined && loadItem.dataset.admission !== null && loadItem.dataset.admission !== undefined)
                        {
                            document.querySelector('.count_order_mnoga').setAttribute('data-admission', loadItem.dataset.admission);
                        }
                        else
                        {
                            document.querySelector('.count_order_mnoga').setAttribute('data-admission', '');
                        }
                    }
                    else
                    {
                        document.querySelector('.count_order_mnoga').setAttribute('data-admission', '');
                    }
                }
                else
                {
                    document.querySelector('.count_order_mnoga').setAttribute('data-admission', '');
                }
            }



            if (screen.width > 960) {

                var article = document.querySelector('#add_order_button'),
                    img = document.querySelector('.cat-img img'),
                    img_popup = document.querySelector('.img-box img'),
                    id = $(item).attr('data-id'),


                    //name = document.querySelector('#contTBgmTopTable .name_' + id).innerText,
                    name_popup = document.querySelector('#popup_name'),

                    itogo = document.querySelector('.price'),

                    price = item.dataset.price,
                    quantityStockroom = item.dataset.q;



                var bonusActions = new BonusActions();
                //console.log(BonusActions);

                var inputCount = document.querySelector('#count_good');


                if(param == 'order')
                {
                    var name = item.children[3].innerText;
                    S.PreparPopUp(item, param);

                    inputCount.value = item.dataset.quantity_order;
                    inputCount.dataset.quantity = item.dataset.quantity_order;
                    //inputCount.setAttribute('value', item.dataset.quantity_order);

                }
                else
                {
                    var name = document.querySelector('#contTBgmTopTable .name_' + id).innerText;
                    S.PreparPopUp();
                }



                price_popup = document.querySelector('#popup_price');

                var new_good = parseFloat(item.dataset.new);
                price_popup = document.querySelector('#popup_price');
                $('#popup_price').attr('data-price',(price ? price : '0'));


            } else { /// mobile

                var article = document.querySelector('#add_order_button'),
                    img = item.dataset.img,
                    img_popup = document.querySelector('.img-box img'),
                    id = item.dataset.id;
                    //console.log(id);

                    var name = document.querySelector('.txt_name_' + id +',.name_' + id).innerText,
                    name_popup = document.querySelector('#popup_name'),

                    itogo = document.querySelector('.price'),
                    price = document.querySelector('.price_' + id).dataset.price,
                    price_popup = document.querySelector('#popup_price');
                //console.log(document.querySelector('td .name_' + id+' span')); return;
            }


                /*------    ------*/
                var bonusEl = document.getElementById('bonus_count');

                if (bonusEl !== null) {

                    if (bonus > 0) {
                        bonusEl.parentElement.style.display = 'block';
                        bonusEl.dataset.bonus_product = bonus.toFixed(2);

                        if(param == 'order')
                        {
                            bonusEl.innerHTML = Number.parseFloat(bonus * item.dataset.quantity_order).toFixed(2);
                        }
                        else
                        {
                            bonusEl.innerHTML = bonus.toFixed(2);
                        }

                    } else {
                        bonusEl.parentElement.style.display = 'none';
                        bonusEl.dataset.bonus_product = bonus;

                        if(param == 'order')
                        {
                            bonusEl.innerHTML = Number.parseFloat(bonus * item.dataset.quantity_order).toFixed(2);
                        }
                        else
                        {
                            bonusEl.innerHTML = bonus.toFixed(2);
                        }

                    }
                    bonusEl.BonusProduct = bonus;
                }

                var extrabonusEl = document.querySelector('#extrabonus_count');
                if(extrabonusEl !== null) {

                    if(extrabonus > 0)
                    {
                        extrabonusEl.parentElement.style.display = 'block';
                        extrabonusEl.dataset.extrabonus_product = extrabonus.toFixed(2);

                        if(param == 'order')
                        {
                            extrabonusEl.innerHTML = Number.parseFloat(extrabonus * item.dataset.quantity_order).toFixed(2);
                        }
                        else
                        {
                            extrabonusEl.innerHTML = extrabonus.toFixed(2);
                        }

                    }
                    else
                    {
                        extrabonusEl.parentElement.style.display = 'none';
                        extrabonusEl.dataset.extrabonus_product = extrabonus.toFixed(2);

                        if(param == 'order')
                        {
                            extrabonusEl.innerHTML = Number.parseFloat(bonus * item.dataset.quantity_order).toFixed(2);
                        }
                        else
                        {
                            extrabonusEl.innerHTML = extrabonus.toFixed(2);
                        }
                    }
                    extrabonusEl.BonusProduct = extrabonus;
                }
                /*------    ------*/




            name = name.replace('%', '');

            name_popup.innerText = "";
            name_popup.innerHTML = '<p style="font-size:12px"> Артикул: '+catalogCode+'</p>' + name;

            if (screen.width > 960) {
                img_popup.setAttribute('src', img.src);
                img_popup.setAttribute('alt', name);
            } else {
                //console.log(img);
                if (img == '') {
                    img = "/images/no_photo.gif";
                }
                img_popup.setAttribute('src', img);
                img_popup.setAttribute('alt', name);
            }


            if(param !== 'order')
            {
                document.querySelector('.add_button').setAttribute('data-ids', id);
            }




            document.querySelector('#count_good').setAttribute('data-q', item.dataset.q);
            price_popup.innerText = 'Цена:' + price;
            itogo.innerText = 'Итого: ' + price;
            //// пересчет итоговой суммы внизу.
            //// если товар в корзине - в попапе сообщение
            if (item.classList.contains('color-lgt_green')) {
                var in_cart = document.querySelector('.in_cart').innerText = 'Позиция уже есть в корзине!';
                var in_cart = document.querySelector('.in_cart_count').innerText = 'Будет изменено количество товара.';
            } else {
                var in_cart = document.querySelector('.in_cart').innerText = '';
                var in_cart = document.querySelector('.in_cart_count').innerText = '';
            }
            /// получим и запишем текущее количество товара
            var quantity = document.querySelector('.quantity_' + id).dataset.q;
            document.querySelector('#count_good').setAttribute('data-quantity', quantity);
            //console.log(document.querySelector('#count_good').value);
            if (quantity == '0') {

                var productsCountDescr = document.querySelector('.count_order_mnoga');

                if (productsCountDescr !== null && productsCountDescr !== undefined)
                {
                    if (productsCountDescr.hasAttribute('data-admission'))
                    {
                        if (productsCountDescr.dataset.admission !== '')
                        {
                            productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки. Ориентировочная дата нового поступления – " + productsCountDescr.dataset.admission + " Возможно, изменение стоимости нового поступления.";
                        }
                        else
                        {
                            productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки.";
                        }
                    }
                    else
                    {
                        productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки.";
                    }
                }

                //document.querySelector('.count_order_mnoga').innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки. Недостающее количество будет зарезервировано и поставлено в течение 14 дней. Возможно изменение стоимости в связи с изменением цены поступления.";
                // document.querySelector('.add_button').removeAttribute('id');
                // document.querySelector('#count_good').setAttribute('disabled', 'disabled');
                // document.querySelector('.jq-number').style.display = 'none';

            } else {
                document.querySelector('#count_good').removeAttribute('disabled');
                document.querySelector('.count_order_mnoga').innerHTML = "";

                if(param != 'order')
                {
                    document.querySelector('.add_button').setAttribute('id', 'add_order_button');
                }

                document.querySelector('.jq-number').removeAttribute('style');
            }


            var withFromYY = document.getElementById('with_from_yy');

            if (withFromYY !== undefined && withFromYY !== null)
            {

                if (item.dataset.yy !== null && item.dataset.yy !== undefined && item.dataset.yy === 'Y')
                {

                    var pPrice = document.getElementById('popup_price');

                    if (pPrice !== null && pPrice !== undefined)
                    {
                        //withFromYY.style.top = (pPrice.offsetTop - 4) + 'px';
                    }

                    withFromYY.style.display = 'inline-block';
                }
                else
                {
                    withFromYY.style.display = 'none';
                }
            }


            //////
            S.DetailPopContainer.isOpenPoup = true;
            S.DetailPopContainer.style.display = 'block';
        }
        else {

            $('#count_good').val(1);
            $('#count_good').attr('data-quantity', 100);

            S.DetailPopContainer.isOpenPoup = false;
            S.DetailPopContainer.style.display = 'none';
            S.table.CanUped = true;
            S.DetailPopContainer.triggerInput = false;
            S.isfRtrigger = false;


        }
    }

    sendAjax(item) {

    }

    //Tools
    PreparPopUp(item, param){
        var S = this;

        var btns = S.DetailPopContainer.querySelector('.submit-box');

        btns.removeChild(btns.firstElementChild);
        btns.removeChild(btns.firstElementChild);

        if(param == 'order')
        {
            var bSave = document.createElement('BUTTON');
            bSave.classList.add('saveOrdButtonCat');
            bSave.innerText = 'Сохранить';

            var bDel = document.createElement('BUTTON');
            bDel.classList.add('deleteOrdButtonCat');
            bDel.innerText = 'Удалить';

            btns.appendChild(bSave);
            btns.appendChild(bDel);


            bSave.onclick = function(event){

                event.preventDefault();

                //if(event.target.className == 'saveOrdButtonCat')
                //{

                    console.log('del');

                    var orderId = item.dataset.order_id,
                        basketId = item.dataset.basket_id,
                        quantity = document.querySelector('#popup-product #count_good').value,
                        amount = item.dataset.q;

                    $.ajax({
                        url: '/local/ajax/actionOrder.php',
                        type: 'POST',
                        async: false,
                        data: {
                            action: "changeProductInOrder",
                            orderId: orderId,
                            basketId : basketId,
                            quantity: quantity,
                            amount: amount
                        },
                        //dataType: 'json',
                        success: function(result) {

                            location.href = '/catalog/';
                        }
                    });

                //}
            }

            bDel.onclick = function(event){

                event.preventDefault();

                //if(event.target.className == 'deleteOrdButtonCat')
                //{
                    console.log('s');

                    var orderId = item.dataset.order_id,
                        basketId = item.dataset.basket_id;

                    $(".popup.popup-item-delete").show().addClass("orderPopupAction");
                    //$("#popup-product").css({'display':'none'});
                    $('#popup-product .close-inp').click();
                    $(".popup.popup-item-delete").show().find(".btn-box").show();
                    $(".popup.popup-item-delete").find(".conf-text").empty().append('<span class="red">Внимание! </span>Вы действительно хотите удалить товар?');

                    $(".popup.popup-item-delete").find(".btn.delgmTrue").data('a', 'b');

                    var bdelet = $(".popup.popup-item-delete").find(".btn.delgmTrue");
                    bdelet[0].dataset.orderId = orderId;
                    bdelet[0].dataset.basketId = basketId;

                    S.revisionOrderUpdate = true;

                //}
            }

            /*bSave.onclick = function(event){

                if(event.toElement.className === 'saveOrdButtonCat')
                {
                    event.preventDefault();

                    var orderId = item.dataset.order_id,
                        basketId = item.dataset.basket_id,
                        quantity = document.querySelector('#popup-product #count_good').value,
                        amount = item.dataset.q;

                    $.ajax({
                        url: '/local/ajax/actionOrder.php',
                        type: 'POST',
                        async: false,
                        data: {
                            action: "changeProductInOrder",
                            orderId: orderId,
                            basketId : basketId,
                            quantity: quantity,
                            amount: amount
                        },
                        //dataType: 'json',
                        success: function(result) {

                            location.href = '/catalog/';
                        }
                    });

                }
            }

            bDel.onclick = function(event){

                if(event.toElement.className === 'deleteOrdButtonCat')
                {
                    event.preventDefault();

                    var orderId = item.dataset.order_id,
                        basketId = item.dataset.basket_id;

                    $(".popup.popup-item-delete").show().addClass("orderPopupAction");
                    //$("#popup-product").css({'display':'none'});
                    $('#popup-product .close-inp').click();
                    $(".popup.popup-item-delete").show().find(".btn-box").show();
                    $(".popup.popup-item-delete").find(".conf-text").empty().append('<span class="red">Внимание! </span>Вы действительно хотите удалить товар?');

                    $(".popup.popup-item-delete").find(".btn.delgmTrue").data('a', 'b');

                    var bdelet = $(".popup.popup-item-delete").find(".btn.delgmTrue");
                    bdelet[0].dataset.orderId = orderId;
                    bdelet[0].dataset.basketId = basketId;

                    S.revisionOrderUpdate = true;

                }
            }*/

        }
        else
        {
            var bCansel = document.createElement('BUTTON');
            bCansel.classList.add('cancelgmButton');
            bCansel.innerText = 'Отмена';

            var bAdd = document.createElement('BUTTON');
            bAdd.id = 'add_order_button';
            bAdd.classList.add('add_button');
            bAdd.innerText = 'Добавить';

            btns.appendChild(bCansel);
            btns.appendChild(bAdd);
        }
    }

    openPresentProductPopup (item) {

        var S = this;

        if (item !== null && item !== undefined && item.hasAttribute('data-present-products')) {

            if(item.dataset.presentProducts !== null && item.dataset.presentProducts !== undefined && parseInt(item.dataset.presentProducts) > 0) {

                var productIds = item.dataset.presentProducts;
                var formData = new FormData();
                var xhr = new XMLHttpRequest();

                xhr.open('POST', '/local/ajax/catalog.php', true);

                formData.append("action", 'getPresentProductData');
                formData.append("presentProduct", productIds);

                xhr.onreadystatechange = function() {

                    if (this.readyState != 4)
                    {
                        return;
                    }

                    if (this.status == 200)
                    {
                        var res = this.response;

                        if (res !== null)
                        {

                            var presents = JSON.parse(res);
                            var presentsNode = S.presentProductPopup.querySelector('.present-list');


                            if (presentsNode !== null && presentsNode !== undefined)
                            {
                                var name = '';
                                var imgSrc = '';
                                var descr = '';
                                var extDescr = '';

                                for(var i = 0; i < presents.length; i++){

                                    if (presents[i]['NAME'] !== null && presents[i]['NAME'] !== undefined && presents[i]['NAME'] !== '')
                                    {
                                        name = presents[i]['NAME'];
                                    }
                                    else
                                    {
                                        name = '';
                                    }


                                    if (presents[i]['IMAGE_SRC'] !== null && presents[i]['IMAGE_SRC'] !== undefined && presents[i]['IMAGE_SRC'] !== '')
                                    {
                                        imgSrc = presents[i]['IMAGE_SRC'];
                                    }
                                    else
                                    {
                                        imgSrc = '';
                                    }


                                    if (presents[i]['PROGRAM_DESCR'] !== null && presents[i]['PROGRAM_DESCR'] !== undefined && presents[i]['PROGRAM_DESCR'] !== '')
                                    {
                                        descr = presents[i]['PROGRAM_DESCR'];
                                    }
                                    else
                                    {
                                        descr = '';
                                    }


                                    /*if (presents[i]['PROGRAM_EXT_DESCR'] !== null && presents[i]['PROGRAM_EXT_DESCR'] !== undefined && presents[i]['PROGRAM_EXT_DESCR'] !== '')
                                    {
                                        extDescr = presents[i]['PROGRAM_EXT_DESCR'];
                                    }
                                    else
                                    {
                                        extDescr = '';
                                    }*/




                                    var itemPresentNode = document.createElement('div');
                                    itemPresentNode.setAttribute('class', 'present-list-item');


                                    // name
                                    var nameNode = document.createElement('div');
                                    nameNode.setAttribute('class', 'product-name');
                                    nameNode.innerText = name;

                                    itemPresentNode.appendChild(nameNode);


                                    // image
                                    var imageNode = document.createElement('img');
                                    imageNode.setAttribute('class', 'present-product');
                                    imageNode.setAttribute('src', imgSrc);
                                    imageNode.setAttribute('alt', name);

                                    itemPresentNode.appendChild(imageNode);


                                    // descr
                                    var descrNode = document.createElement('div');
                                    descrNode.setAttribute('class', 'programs-description');
                                    descrNode.innerText = descr;

                                    itemPresentNode.appendChild(descrNode);


                                    // ext descr
                                    /*
                                    var extDescrNode = document.createElement('div');
                                    extDescrNode.setAttribute('class', 'programs-ext-description');
                                    extDescrNode.innerText = extDescr;

                                    itemPresentNode.appendChild(extDescrNode);
                                    */


                                    presentsNode.appendChild(itemPresentNode);


                                }
                            }


                            S.presentProductPopup.style.display = 'block';
                            S.presentProductPopup.isOpenPoup = true;

                        }
                    }
                }

                xhr.send(formData);
            }

        }
    }

    closePresentProductPopup () {

        var S = this;

        S.presentProductPopup.style.display = 'none';
        S.presentProductPopup.isOpenPoup = false;

        var presentsNode = S.presentProductPopup.querySelector('.present-list');

        if (presentsNode !== null && presentsNode !== undefined)
        {
            presentsNode.innerHTML = '';
        }
    }


    getDataCumulativePresentPopup () {

        var S = this;

        var formData = new FormData();
        var xhrData = new XMLHttpRequest();
        var data = null;

        xhrData.open('POST', '/local/ajax/checkCumulativePresentShow.php', true);

        formData.append("action", 'checkCumulativePresentShow');

        xhrData.onreadystatechange = function() {

            if (this.readyState != 4)
            {
                return;
            }

            if (this.status == 200)
            {
                var dataResponse = this.response;

                if (dataResponse !== null)
                {
                    data = JSON.parse(dataResponse);

                    if (data.present !== null && parseInt(data.present) > 0)
                    {
                        S.openCumulativePresentPopup(data);
                    }
                }
            }
        }

        xhrData.send(formData);

    }

    openCumulativePresentPopup (data) {

        var S = this;

        var formData = new FormData();
        var xhr = new XMLHttpRequest();

        if (data !== null)
        {

            xhr.open('POST', '/local/ajax/catalog.php', true);

            formData.append("action", 'getPresentProductData');
            formData.append("presentProduct", data.present);

            xhr.onreadystatechange = function() {

                if (this.readyState != 4)
                {
                    return;
                }

                if (this.status == 200)
                {
                    var res = this.response;

                    if (res !== null)
                    {

                        var servData = JSON.parse(res);

                        if (servData[0] !== null && servData[0] !== undefined)
                        {
                            var titleNode = S.cumulativePresentProductPopup.querySelector('h2');

                            if (titleNode !== null && titleNode !== undefined)
                            {
                                titleNode.innerText = 'Поздравляем! Вы получили подарок!';
                            }

                            if (servData[0].NAME !== null && servData[0].NAME !== undefined)
                            {
                                var productNameNode = S.cumulativePresentProductPopup.querySelector('.product-name');

                                if (productNameNode !== null && productNameNode !== undefined)
                                {
                                    productNameNode.innerText = servData[0].NAME;
                                }
                            }

                            if (servData[0].IMAGE_SRC !== null && servData[0].IMAGE_SRC !== undefined)
                            {
                                var productPicture = S.cumulativePresentProductPopup.querySelector('img.present-product');

                                if (productPicture !== null && productPicture !== undefined)
                                {
                                    productPicture.setAttribute('src', servData[0].IMAGE_SRC);
                                }

                            }

                            if (servData[0].PROGRAM_DESCR !== null && servData[0].PROGRAM_DESCR !== false)
                            {
                                var divDescr = S.cumulativePresentProductPopup.querySelector('.programs-description');

                                divDescr.innerHTML = '';
                            }
                        }

                        S.cumulativePresentProductPopup.style.display = 'block';
                        S.cumulativePresentProductPopup.isOpenPoup = true;
                    }
                }
            }

            xhr.send(formData);

        }

    }

    closeCumulativePresentPopup () {

        var S = this;

        S.cumulativePresentProductPopup.style.display = 'none';
        S.cumulativePresentProductPopup.isOpenPoup = false;

        var titleNode = S.cumulativePresentProductPopup.querySelector('h2');

        if (titleNode !== null && titleNode !== undefined)
        {
            titleNode.innerText = '';
        }


        var productNameNode = S.cumulativePresentProductPopup.querySelector('.product-name');

        if (productNameNode !== null && productNameNode !== undefined)
        {
            productNameNode.innerText = '';
        }


        var productPicture = S.cumulativePresentProductPopup.querySelector('img.present-product');

        if (productPicture !== null && productPicture !== undefined)
        {
            productPicture.setAttribute('src', '/images/no_photo.gif');
        }


        var divDescr = S.cumulativePresentProductPopup.querySelector('.programs-description');

        if (divDescr !== null && divDescr !== undefined)
        {
            divDescr.innerHTML = '';
        }




    }

}

class MobileMenu {

    constructor() {

        this.MenuContainer = document.querySelector('#mob-mn');
        this.MenuContainer.isOpen = false;

        this.Events();
    }

    Events() {
        var S = this;

        document.body.addEventListener('click', function (e) {

            var parent = e.target.closest('tr');

            if (parent !== undefined && parent !== null)
            {

                if(parent.hasAttribute('data-present') == false)
                {
                    return;
                }
            }

            // #mob-mn
            if (e.target.classList.contains('opener') && !S.MenuContainer.isOpen) {
                S.OpenMenu();
                return;
            }

            if ((e.target.classList.contains('close-menu') || !e.target.closest('.mob-menu ul')) && S.MenuContainer.isOpen) {
                S.OpenMenu();
                return;
            }


        });
    }

    OpenMenu() {
        var S = this;

        if (!S.MenuContainer.isOpen) {
            S.MenuContainer.style.display = 'block';
            S.MenuContainer.isOpen = true;
        } else {
            S.MenuContainer.style.display = 'none';
            S.MenuContainer.isOpen = false;
        }

    }
}

class MobileCatalog {
    constructor() {

        this.CatalogMainContainer = document.querySelector('.catalog-popup');
        this.CatalogMainContainerHid = this.CatalogMainContainer.querySelector('.cat-bx');
        this.CatalogMainContainer.isOpen = false;
        this.Steps = [];
        this.Steps.push(this.CatalogMainContainer);

        this.scrollContaiber = document.querySelector('.cat-bx .cat-scroll');
        this.scrollContaiber.style.height = screen.height + 'px';

        this.Events();
    }

    Events() {
        var S = this;

        document.body.addEventListener('click', function (e) {
            // OpenCatalog
            if (e.target.classList.contains('click-cat')) {
                S.OpenCatalog();
                return;
            }
            if (!e.target.closest('.cat-bx') && S.CatalogMainContainer.isOpen) {
                if (S.Steps.length > 1)
                    S.removeAllSteps();
                S.OpenCatalog();
                return;
            }

            //StepCatalog
            if (e.target.closest('.cat-scroll li')) {
                if (S.hasChildCatalog(e.target)) {
                    S.nextCatalogStep(e.target);
                } else {
                    setTimeout(function () {
                        S.removeAllSteps();
                        S.OpenCatalog();
                    }, 10);
                    return;
                }
            }
            if (e.target.closest('.backgmhid') && S.Steps.length > 1) {
                S.PrevCatalogStep();
                return;
            }

        });

        S.CatalogMainContainer.firstElementChild.firstElementChild.addEventListener('click', function (e) {

            S.OpenCatalog();

        });


        S.CatalogMainContainerHid.addEventListener('transitionend', function (e) {
            if (!S.CatalogMainContainer.isOpen)
                S.CatalogMainContainer.style.display = 'none';


        });

    }

    OpenCatalog() {
        var S = this;
        var headerHeight = document.querySelector("#header").offsetHeight;

        if (!S.CatalogMainContainer.isOpen) {
            S.CatalogMainContainer.isOpen = true;
            S.CatalogMainContainer.style.display = 'block';
            S.CatalogMainContainer.style.marginTop = headerHeight + 'px';
            S.CatalogMainContainerHid.style.marginLeft = -screen.width + 'px';
            setTimeout(function () {
                S.CatalogMainContainerHid.style.marginLeft = '0px';
            }, 10);
        } else {
            S.CatalogMainContainerHid.style.marginLeft = -screen.width + 'px';
            S.CatalogMainContainer.isOpen = false;
        }
        if(document.querySelector("#bx-panel")) {
          var bxPanelHeight = document.querySelector("#bx-panel").offsetHeight;

          S.CatalogMainContainer.style.marginTop = (bxPanelHeight + headerHeight) + 'px';
        }

    }

    //Catalog Logica
    hasChildCatalog(item) {
        var S = this;
        var result = false;

        if (item.nextElementSibling) result = true;

        return result;
    }

    nextCatalogStep(item) {
        var S = this;

        S.NextCatalogStepContainer = S.CatalogMainContainer.cloneNode(true);

        S.NextCatalogStepContainer.querySelector('.cat-scroll').innerHTML = '';
        S.NextCatalogStepContainer.querySelector('.cat-scroll').appendChild(item.nextElementSibling.cloneNode(true));
        S.NextCatalogStepContainer.style.display = 'block';
        S.NextCatalogStepContainer.querySelector('.cat-bx').style.marginLeft = -screen.width + 'px';
        S.NextCatalogStepContainer.firstElementChild.firstElementChild.classList.add('backgmhid');

        S.Steps.push(S.NextCatalogStepContainer);
        document.body.appendChild(S.NextCatalogStepContainer);

        setTimeout(function () {
            S.NextCatalogStepContainer.querySelector('.cat-bx').style.marginLeft = '0px';
        }, 10);
        S.hidPrevSteps();
    }

    PrevCatalogStep() {
        var S = this;
        S.removeLastSteps();

    }

    hidPrevSteps() {
        var S = this;

        for (var i = 0; i < S.Steps.length - 1; i++) {
            S.Steps[i].style.display = 'none';
        }
    }

    removeAllSteps() {
        var S = this;

        if (S.Steps.length > 1) {
            document.body.removeChild(S.Steps[1]);
            S.Steps.splice(1, 1);
            S.removeAllSteps();
        }
    }

    removeLastSteps() {
        var S = this;

        var Element = S.Steps[S.Steps.length - 1];

        Element.addEventListener('transitionend', function (e) {
            document.body.removeChild(S.Steps[S.Steps.length - 1]);
            S.Steps.splice(S.Steps.length - 1, 1);
        });

        S.Steps[S.Steps.length - 2].style.display = 'block';
        setTimeout(function () {
            Element.querySelector('.cat-bx').style.marginLeft = -screen.width + 'px';
        }, 10);
    }
}

function initAll(){

    let resizeCabinet = new Resizing();
    //let resizeTable = new Table();
    let tabs = new Tab();
    let viewer = new Viewer();

    let mobMenu = new MobileMenu();
    let mobCatalog = new MobileCatalog();

    window.wmc = viewer;
}

document.addEventListener('DOMContentLoaded', function (e) {

    initAll();
    /* console.log(window.x = (function addEllipsis() {
     return (function () {
     return arguments[0] && (window.number = ((!!arguments[1]) ? arguments[1] : arguments[0].length / ((6 / 3 / 0.5) * 0.5))) && !!arguments[0][number] && (arguments[0] = arguments[0].slice(0, number)) && (arguments[0] += '...');
     }(arguments[0], arguments[1]));
     }('ksdngusgnsdjkgnjsdgjksdngjknsdjkgnsdjkngjksdngjkn')));*/


    $('body').on('click', '.first_lev,.second_lev', function () {
        if (screen.width > 1023) {
            $('.filter').attr('data-section_id', '');
            var section_id = $(this).data('section_id');

            var sections = $('.tovar:first').data('section');
            $('.sort').attr('data-section_id', sections);
            $('.clear_form').attr('data-section_id', section_id);
            //console.log("click menu - " + section_id);
            $('.sort').attr('data-section_id', section_id);
            $.ajax({
                url: '/local/ajax/catalog.php',
                type: 'post',
                data: {
                    section_id: section_id,
                },
                success: function (data) {
                    $('.table-cat tbody tr').remove();
                    $('.table-cat tbody').append(data);

                    window.wmc.table.setColWidth();
                    var loadedElement = [];
                    $('#grid tbody tr').each(function () {
                        loadedElement.push(1);
                    });
                    var sumElements = loadedElement.length;
                    // console.log(sumElements);
                    var elements = $('.hidden-count_sum').val();
                    if (!elements) {
                        $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + sumElements);
                    } else {
                        $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + elements);
                    }

                },
                // beforeSend: function() {
                //     $('.main-holder').addClass('loader');
                // },
                error: function (error) {
                    console.log(error);
                },
                // complete: function() {
                //     $('.main-holder').removeClass('loader');
                // },

            });
        } else { /// mobile
            var section_id = $(this).data('section_id');
            $('.sort').attr('data-section_id', section_id);
            $.ajax({
                url: '/local/ajax/mobile_catalog.php',
                type: 'post',
                data: {
                    section_id: section_id,
                },
                success: function (data) {
                    $('.table-cat tbody tr').remove();
                    $('.table-cat tbody').append(data);

                    window.wmc.table.setColWidth();

                },
                error: function (error) {
                    console.log(error);
                }

            });
        }

    });
    $('body').on('click', '.third_lev', function () {
        if (screen.width > 1023) {
            var section_id = $(this).data('section_id');
            var responce_data = null;
            $('.sort').attr('data-section_id', section_id);
            $('.clear_form').attr('data-section_id', section_id);
            var value_analog = $('.getProp:first td .ic-going').data('analog');
            // console.log(value_analog);
            $.ajax({
                url: '/local/ajax/catalog.php',
                type: 'post',
                data: {
                    elements: section_id, ///// добавить
                    analogi: value_analog
                },
                success: function (data) {
                    responce_data = data;
                    $('.table-cat tbody tr').remove();
                    $('.table-cat tbody').append(responce_data);
                    $('.sort').addClass('element');
                    window.wmc.table.setColWidth();

                    var loadedElement = [];
                    $('#grid tbody tr').each(function () {
                        loadedElement.push(1);
                    });
                    var sumElements = loadedElement.length;
                    //  console.log(sumElements);
                    var elements = $('.hidden-count_sum').val();
                    if (!elements) {
                        $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + sumElements);
                    } else {
                        $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + elements);
                    }

                },
                beforeSend: function () {
                    $('#grid').addClass('loader');
                },
                error: function (error) {
                    console.log(error);
                },
                complete: function () {
                    $('#grid').removeClass('loader');
                },

            });
        } else {
            var section_id = $(this).data('section_id');
            $('.sort').attr('data-section_id', section_id);
            var value_analog = $('.getProp:first td .ic-going').data('analog');
            // console.log(value_analog);
            $.ajax({
                url: '/local/ajax/mobile_catalog.php',
                type: 'post',
                data: {
                    elements: section_id, ///// добавить
                    analogi: value_analog
                },
                success: function (data) {
                    $('.table-cat tbody tr').remove();
                    $('.table-cat tbody').append(data);
                    $('.sort').addClass('element');
                    window.wmc.table.setColWidth();
                },
                error: function (error) {
                    console.log(error);
                }

            });
        }
    });


    $('body').on('click', '.getProp', function (event) {
        var el = event.target.closest('tr');

        //remove active class
        $('.second_tab').removeClass('active');
        $('.kharakt_info').removeClass('active');
        $('.kharakt_info').removeClass('visible');
        var id = el.dataset.id;
        var analog = el.dataset.analog;

        get_prop_element({id: id, analog: analog});
    });
    document.body.addEventListener('keydown', function (event) {
        var el = document.querySelector('.color-yell');
        if (!el)return;
        var id = el.dataset.id;
        var analog = el.dataset.analog;
        if (event.keyCode == 40) {
            if(!window.wmc.DetailPopContainer.isOpenPoup)
            {
                if(delayItemProductDataAjax === true)
                {
                    delayItemProductDataAjax = false;

                    setTimeout(function(){

                        get_prop_element({id: id, analog: analog});
                        delayItemProductDataAjax = true;

                    }, 1500);
                }
            }

        }
        if (event.keyCode == 38) {
            if(!window.wmc.DetailPopContainer.isOpenPoup)
            {
                if(delayItemProductDataAjax === true)
                {
                    delayItemProductDataAjax = false;

                    setTimeout(function(){

                        get_prop_element({id: id, analog: analog});
                        delayItemProductDataAjax = true;

                    }, 1500);
                }
            }
        }
    });


    var tableOrders = document.getElementById('contTBgmTable');
    tableOrders.addEventListener('click', function(e){

        if(e.target.closest('tr.order_goods') !== null && e.target.closest('tr.order_goods') !== undefined)
        {
            var tr = e.target.closest('tr.order_goods');
            get_prop_element({id: tr.dataset.id, analog: tr.dataset.analog});
        }
    });

    function get_prop_element(obj) {

        var id = obj.id;
        var value_analog = obj.analog;
        $.ajax({
            url: '/local/ajax/catalog.php',
            type: 'post',
            dataType: 'json',
            data: {
                element_property: id
            },
            success: function (data) {

                console.log('get prop');

                $('.main_prop tr').remove();
                $('.main_prop').append(data.main);

                // POPUP IMAGE
                if (data.image == null) {
                    $('#popup-foto div img').attr('src', '/images/no_photo.gif');
                    $('.cat-img img').attr('src', '/images/no_photo.gif');
                } else {
                    $('.cat-img img').attr('src', data.image);
                    $('.cat-img img').attr('alt', data.alt);
                    $('.cat-img img').attr('title', data.alt);
                    $('#popup-foto div img').attr('src', data.image);
                }

                $('#popup-foto div img').attr('alt', data.alt);

                //характеристики
                $('.main_kharakteristiki tr').remove();
                $('.main_kharakteristiki').append(data.kharakteristika);


                // console.log(data.main2);
                /// комментарий сбыта
                if (data.coment_sbuta != '') {
                    $('#coment_sbut').text(data.coment_sbuta);
                } else {
                    $('#coment_sbut').text('Нет комментариев');
                }
            },
            error: function (error) {
                console.log(error);
            }

        });


        /// analogi
        if (value_analog != '') {
            $('.analog_tab').css('display', 'block');
            $.ajax({
                url: '/local/ajax/catalog.php',
                type: 'post',
                data: {
                    analogi: value_analog
                },
                success: function (data) {
                    $('.analogi_bottom tbody tr').remove();
                    $('.analogi_bottom tbody').append(data);
                },
                error: function (error) {
                    console.log(error);
                }

            });
        } else {
            $('.analog_tab').css('display', 'none');
            $('.main_info').addClass('visible').addClass('active');
            $('.first_tab').addClass('active');

        }
    }


    /// аналоги
    $('body').on('click', '.ic-going', function () {
        var value = $(this).data('analog');
        if (value != '') {
            $.ajax({
                url: '/local/ajax/catalog.php',
                type: 'post',
                data: {
                    analogi: value
                },
                success: function (data) {
                    $('.popupAnalog tbody tr').remove();
                    $('.popupAnalog tbody').append(data);
                    // console.log(data);

                },
                error: function (error) {
                    console.log(error);
                }

            });
        }
    });

    ///  очистка поля поиска по колонкам
    document.body.addEventListener('click', function (event) {
        parent = event.target.parentNode;
        if (parent !== null) {
            input = parent.querySelector('input.filter');
            if (input !== null && input.value !== undefined && input.value !== null && input.value !== '') {
                input.value = '';

                if (filterByFields({NUMBER_PAGE: 1, ORDER_BY: 'id', ORDER: 'asc'})) {
                    return false;
                }
                else {
                    search = document.querySelector('.inpsearchgm1');
                    if (search.value === '' || search.value === null || search === undefined) {
                        // input search is null
                        var menuAtemActive = null;
                        menuAtemActive = document.querySelector('#horizontal-multilevel-menu a.active');
                        if (menuAtemActive !== null) {
                            var data = {
                                section_id: menuAtemActive.getAttribute('data-section_id'),
                                current_page: 0,

                            };
                        }
                        else {
                            var data = {ajax_load: '', current_page: 1};
                        }
                        $.ajax({
                            url: '/local/ajax/catalog.php',
                            type: 'post',
                            data: data,
                            success: function (data) {
                                $('.table-cat tbody tr').remove();
                                $('.table-cat tbody').append(data);
                                window.wmc.table.setColWidth();
                                var loadedElement = [];
                                $('#grid tbody tr').each(function () {
                                    loadedElement.push(1);
                                });
                                var sumElements = loadedElement.length;
                                var elements = $('.hidden-count_sum').val();
                                if (!elements) {
                                    $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + sumElements);
                                } else {
                                    $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + elements);
                                }
                                // console.log('work');
                            },
                            error: function (error) {
                                console.log(error);
                            },
                        });
                    }
                    else {

                        if (filterByFields()) {
                            return false;
                        }

                        $.ajax({
                            url: '/local/ajax/search.php',
                            type: 'post',
                            data: {
                                search: search.value
                            },
                            success: function (data) {
                                $('.table-cat tbody tr').remove();
                                $('.table-cat tbody').append(data);

                                window.wmc.table.setColWidth();
                                $('.filter').attr('data-section_id', 'search');

                                /// запись в историю
                                var history_value = $('.inpsearchgm1').val();
                                $.ajax({
                                    url: '/local/ajax/page.php',
                                    type: 'post',
                                    data: {
                                        history: history_value
                                    },
                                    success: function (data) {
                                        //console.log(data);
                                    },
                                    error: function (error) {
                                        //console.log(error);
                                    }

                                });


                                // var loadedElement = [];
                                // $('#grid tbody tr').each(function () {
                                //     loadedElement.push(1);
                                // });
                                // var sumElements = loadedElement.length;
                                // var elements = $('.hidden-count_sum').val();
                                // if (!elements) {
                                //     $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + sumElements);
                                // } else {
                                //     $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + elements);
                                // }
                            },
                            error: function (error) {
                                console.log(error);
                            }

                        });
                    }
                }
            }
        }
    });


    /// подгрузка по умолчанию
    var id = $('.getProp:first').attr('data-id');
    $('.sort').attr('data-section_id', ''); /// для подгрузки всех товаров, если только попали в каталох
    $.ajax({
        url: '/local/ajax/catalog.php',
        type: 'post',
        dataType: 'json',
        data: {
            element_property: id
        },
        success: function (data) {
            $('.main_prop tr').remove();
            $('.main_prop').append(data.main);
            $('.cat-img img').attr('src', data.image);
            $('.cat-img img').attr('alt', data.alt);
            $('.cat-img img').attr('title', data.alt);

            // POPUP IMAGE
            $('#popup-foto div img').attr('src', data.image);
            $('#popup-foto div img').attr('alt', data.alt);

            //характеристики
            $('.main_kharakteristiki tr').remove();
            $('.main_kharakteristiki').append(data.kharakteristika);


        },
        error: function (error) {
            console.log(error);
        }

    });

    // подгрузим отдельно аналоги
    var value_analog = $('.getProp:first').attr('data-analog');
    //console.log(value_analog);
    if (value_analog == undefined || value_analog == '') {
        $('.analog_tab').css('display', 'none');
        //$('.analog_info_table').remove();
    } else {
        $.ajax({
            url: '/local/ajax/catalog.php',
            type: 'post',
            data: {
                analogi: value_analog
            },
            success: function (data) {
                $('.analogi tbody tr').remove();
                $('.analogi tbody').append(data);
                //$('.analog_tab').show();
            },
            error: function (error) {
                console.log(error);
            }

        });
    }

    /// как и обещал - пересчет итоговой суммы
    $('body').on('click', '.plus,.minus', function () {
        var value = $('#count_good').val();
        var quant = $('#count_good').data('quantity');
        var orderQ = document.querySelector('#count_good').value;

        var price = $('#popup_price').text();
        var arr_price = price.split(':');
        var int_price = parseFloat(arr_price[1], 2);
        // var print_price = Math.round(int_price);
        var suma = int_price * value;

        $('.price').text('Итого: ' + suma.toFixed(2));

        //// смотрим колличество товара и колличество выбраного, если выбраного больше чем есть - вырубаем кнопку

        //var bonus_popup = document.getElementById('bonus_count').dataset.bonus;
        //var price_popup = parseFloat(document.getElementById('popup_price').dataset.price).toFixed(2);
        //var new_good_popup = document.getElementById('bonus_count').dataset.new;
        //var precent_bonus = price_popup  * bonus_popup;


        var bonusEl = document.querySelector('#bonus_count');

        if (bonusEl !== null) {
            var bonus = bonusEl.BonusProduct;

            if (bonus > 0) {
                bonusEl.parentElement.style.display = 'block';
                bonusEl.innerHTML = Number.parseFloat(bonusEl.dataset.bonus_product * orderQ).toFixed(2);
            } else {
                bonusEl.parentElement.style.display = 'none';
                bonusEl.innerHTML = bonus;
            }
        }


        var extrabonusEl = document.querySelector('#extrabonus_count');
        if(extrabonusEl !== null) {

            var extrabonus = extrabonusEl.BonusProduct;

            if(extrabonus > 0)
            {
                extrabonusEl.parentElement.style.display = 'block';
                if(value == 0)
                {
                    extrabonusEl.innerHTML = parseFloat(0).toFixed(2);
                }
                else
                {
                   extrabonusEl.innerHTML = Number.parseFloat(extrabonusEl.dataset.extrabonus_product * orderQ).toFixed(2);
                }

            }
            else
            {
                extrabonusEl.parentElement.style.display = 'none';
                extrabonusEl.innerHTML = extrabonus;
            }
        }


        // if(new_good_popup != 0) {
        //     if (bonus_popup != 0) {
        //         console.log(new_good_popup);
        //         var count_bonus = (precent_bonus / 100) * value * new_good_popup;
        //         $('#bonus_count').text(parseFloat(count_bonus).toPrecision(3));
        //         bonus_popup = null;
        //     }
        // }else{
        //     if (bonus_popup != 0) {
        //         var count_bonus = (precent_bonus / 100) * value;
        //         $('#bonus_count').text(parseFloat(count_bonus).toPrecision(3));
        //         bonus_popup = null;
        //     }
        // }


        var quantity_good = document.querySelector('#count_good').getAttribute('data-quantity');
        var real_quantity = $('.add_button').data('q');

        var quantity_good = 0;

        var real_quantity = document.querySelector('#count_good').getAttribute('data-q');//$('.add_button').data('q');
        //var check_value = quantity_good.substring(1,3);


        if (value > +real_quantity) {
            //document.querySelector('.count_order_mnoga').innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки. Недостающее количество будет зарезервировано и поставлено в течение 14 дней. Возможно изменение стоимости в связи с изменением цены поступления.";

            var productsCountDescr = document.querySelector('.count_order_mnoga');

            if (productsCountDescr !== null && productsCountDescr !== undefined)
            {
                if (productsCountDescr.hasAttribute('data-admission'))
                {
                    if (productsCountDescr.dataset.admission !== '')
                    {
                        productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки. Ориентировочная дата нового поступления – " + productsCountDescr.dataset.admission + " Возможно, изменение стоимости нового поступления.";
                    }
                    else
                    {
                        productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки.";
                    }
                }
                else
                {
                    productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки.";
                }
            }

        } else {
            document.querySelector('.count_order_mnoga').innerHTML = "";
        }

    });


    // тот же пересчет только по событию инпут
    $('body').on('input', '#count_good', function () {

        var value = $('#count_good').val();
        if (value == 0) {

        }
        var price = $('#popup_price').text();

        var arr_price = price.split(':');
        var int_price = parseFloat(arr_price[1], 2);
        var suma = int_price * value;

        $('.price').text('Итого: ' + suma.toFixed(2));


        //// смотрим колличество товара и колличество выбраного, если выбраного больше чем есть - вырубаем кнопку
        var quantity_good = document.querySelector('#count_good').getAttribute('data-quantity');

        var real_quantity = $('.add_button').data('q');

        var quantity_good = 0;

        var real_quantity = document.querySelector('#count_good').getAttribute('data-q');//$('.add_button').data('q');
        //var check_value = quantity_good.substring(1,3);


        // проводим манипуляции с бонусами
        var bonusActions = new BonusActions();
        bonusActions.setQuantityProduct(value);

        bonusActions.readBonus();
        bonusActions.readExtrabonus();

        bonusActions.writeBonus();
        bonusActions.writeExtrabonus();


        if (value > +real_quantity) {
            //document.querySelector('.count_order_mnoga').innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки. Недостающее количество будет зарезервировано и поставлено в течение 14 дней. Возможно изменение стоимости в связи с изменением цены поступления.";

            var productsCountDescr = document.querySelector('.count_order_mnoga');

            if (productsCountDescr !== null && productsCountDescr !== undefined)
            {
                if (productsCountDescr.hasAttribute('data-admission'))
                {
                    if (productsCountDescr.dataset.admission !== '')
                    {
                        productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки. Ориентировочная дата нового поступления – " + productsCountDescr.dataset.admission + " Возможно, изменение стоимости нового поступления.";
                    }
                    else
                    {
                        productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки.";
                    }
                }
                else
                {
                    productsCountDescr.innerHTML = "  <strong>Внимание!</strong> Заказываемое количество, превышает доступные остатки.";
                }
            }

        } else {
            document.querySelector('.count_order_mnoga').innerHTML = "";
        }

    });

    //// очистить счетчик колличества товаров
    $('body').on('click', '.cancelgmButton,.close-inp', function () {

        $('#count_good').val(1);

        if($('#bonus_count') !== undefined) {
            $('#bonus_count').text('');
            $('#bonus_count').data('bonus_product', 0);
            $('#bonus_count').parent().css({'display': 'none'});
        }

        if($('#extrabonus_count') !== undefined) {
            $('#extrabonus_count').text('');
            $('#extrabonus_count').data('extrabonus_product', 0);
            $('#extrabonus_count').parent().css({'display': 'none'});
        }

        return false;

    });

    /////// функционал заказов
    $('body').on('click', '#add_order', function () {
        var count = 0;
        $('.order').each(function () {
            count++;
            // if (count == 5) {
            //     alert('Нельзы создавать больше 6-ти заказов');
            //     location.href = "/";
            // }

        });
        if (count < 5) {
            $.ajax({
                url: '/local/ajax/order.php',
                type: 'post',
                data: {
                    add_order: 1
                },
                success: function (data) {

                    if (data === 'notAuth')
                    {
                        location.href = '/';
                        return;
                    }

                    if (data == 1) {
                        location.href = '/';
                    }
                },
                error: function (error) {
                    console.log(error);
                }

            });

        } else {
            alert('Нельзя создавать больше 5-ти заказов');
            location.href = "/";
        }
    });

    /// добавление товара в корзину

    $('body').on('click', '#add_order_button', function (e) {

        if (screen.width > 1023) {
            var good_id = e.target.dataset.ids;

            e.preventDefault();

            $('.order').each(function () {
                var quantity = $('#count_good').val();
                var order_id = $(this).data('id');
                var $this = $(this);

                if ($(this).hasClass('active') || $(this).hasClass('visible')) {
                    // var xhr = new XMLHttpRequest;
                    // xhr.open('POST', '/local/ajax/order.php');
                    // xhr.addEventListener('load', e => {
                    //     console.dir(e);
                    // });
                    // xhr.addEventListener('error', e => {
                    //     console.dir(e);
                    // });
                    // var formData = new FormData();
                    // // formData.append("add_good", 1);
                    // // formData.append("good_id", good_id);
                    // // formData.append("order_id", order_id);
                    // // formData.append("quantity", quantity);
                    // xhr.send(formData);

                    $.ajax({
                        url: '/local/ajax/order.php',
                        type: 'post',
                        data: {
                            'add_good': 1,
                            'good_id': good_id,
                            'order_id': order_id,
                            'quantity': quantity
                        },
                        success: function (data) {

                            if (data === 'notAuth')
                            {
                                location.href = '/';
                                return;
                            }

                            /// обновим содержимое корзины
                            $.ajax({
                                url: '/local/ajax/order.php',
                                type: 'post',
                                data: {
                                    'check_order_id': order_id,
                                },
                                success: function (data) {

                                    if (data === 'notAuth')
                                    {
                                        location.href = '/';
                                        return;
                                    }

                                    var requestData = JSON.parse(data);
                                    var parent = document.querySelector('.active[data-order_id]');


                                    if ($('.gmcart').hasClass('active')) {
                                        var tab_id = $this[0].dataset.id;
                                        $('.gmcart').each(function () {
                                            var bord_id = $(this)[0].dataset.order_id;
                                            if (bord_id == tab_id) {
                                                $('[data-order^="' + bord_id + '"]').find("tbody tr").remove();
                                                $('[data-order^="' + bord_id + '"]').find("tbody").append(requestData['basketItemsHTML']);

                                                var displaySummcontainer = parent.querySelector('.total_price_sum');

                                                if (displaySummcontainer !== null) {
                                                    displaySummcontainer.innerHTML = requestData['basketSumm'].toFixed(2);//Math.ceil(basketSumm);
                                                }
                                            }
                                        });
                                    }
                                    //$('.gooDs tbody').append(data);
                                    $('#count_good').val(1);
                                    window.wmc.openDetailPopUp(0);
                                    $('.color-yell').addClass('color-lgt_green');






                                if (requestData['bonusValue'] !== null && requestData['bonusValue'] !== undefined) {
                                    var disElemBonus = parent.querySelector('.total_bonus_sum');
                                    if (disElemBonus !== null) {
                                        disElemBonus.innerHTML = requestData['bonusValue'].toFixed(2);
                                        parent.setAttribute('data-order-bonus', requestData['bonusValue'].toFixed(2));
                                    } else {
                                        displaySummcontainer = '<p>Бонусов за заказ <span class="total_bonus_sum">' + requestData['bonusValue'].toFixed(2) + '</span><span> грн.</span></p>';
                                        var totalSummElem = parent.querySelector('.sum-total');
                                        totalSummElem.innerHTML = displaySummcontainer + totalSummElem.innerHTML;
                                    }

                                    var divBonusRebate = parent.querySelector('.bonuse-rebate');
                                    if (divBonusRebate !== null) {
                                        divBonusRebate.innerHTML = requestData['bonusRebate'];
                                    }
                                }



                                    var productTblList = document.getElementById('contTBgmTopTable');

                                    if (productTblList !== null && productTblList !== undefined)
                                    {
                                        var productNode = productTblList.querySelector('tr[data-id="' + good_id + '"]');

                                        if (productNode !== null && productNode !== undefined)
                                        {
                                            var basketProductNode = parent.querySelector('tr[data-id="' + good_id + '"]');

                                            if (basketProductNode !== null && basketProductNode !== undefined)
                                            {
                                                if (basketProductNode.hasAttribute('data-q') && productNode.hasAttribute('data-q'))
                                                {
                                                    basketProductNode.dataset.q = productNode.dataset.q;
                                                }
                                            }
                                        }
                                    }


                                },
                                error: function (error) {
                                    console.log(error);
                                }

                            });

                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(xhr.status);
                            console.dir(thrownError);
                        }

                    });
                }

            });
        } else {
            var good_id = e.target.dataset.ids;
            $('.zakaz-list .row-line').each(function () {
                var quantity = $('#count_good').val();
                var order_id = $(this).data('id');

                if ($(this).hasClass('active')) {
                    $.ajax({
                        url: '/local/ajax/order.php',
                        type: 'post',
                        data: {
                            add_good: 1,
                            good_id: good_id,
                            order_id: order_id,
                            quantity: quantity
                        },
                        success: function (data) {

                            if (data === 'notAuth')
                            {
                                location.href = '/';
                                return;
                            }

                            $('#count_good').val(1);
                            window.wmc.openDetailPopUp(0);
                            $('.color-yell').addClass('color-lgt_green');

                            $.ajax({
                                url: '/local/ajax/order.php',
                                type: 'post',
                                data: {
                                    check_order_id_mobile: order_id,
                                },
                                success: function (data) {

                                    if (data === 'notAuth')
                                    {
                                        location.href = '/';
                                        return;
                                    }

                                    $('[data-order_price_id^="' + order_id + '"]').text(data + ' грн');
                                },
                                error: function (error) {
                                    console.log(error);
                                }

                            });

                        },
                        error: function (error) {
                            console.log(error);
                        }

                    });
                }

            });

        }

    });

    /// сортировка
    $('body').on('click', '.sort', function () {
        $('.sort').each(function () {
            if ($(this).hasClass('activeSort')) {
                $(this).removeClass('activeSort');
            }
        });

        $(this).addClass('activeSort');

        var sort = $(this).data('sort');
        var sec_id = document.querySelector('.activeSort').dataset.section_id;

        if ($(this).hasClass('arr-down')) {
            var typeSort = 'DESC';
        } else if ($(this).hasClass('arr-up')) {
            var typeSort = 'ASC';
        }

        if (filterByFields({ORDER_BY: sort, ORDER: typeSort})) {
            return false;
        }

        var ids = [];
        $('.table-cat tbody tr').each(function () {
            var id = $(this).data('id');
            ids.push(id);
        });

        $.ajax({
            url: '/local/ajax/filter.php',
            type: 'post',
            data: {
                sorting: sort,
                typeSort: typeSort,
                ids: ids

            },
            success: function (data) {
                $('.table-cat tbody tr').remove();
                $('.table-cat tbody').append(data);

                window.wmc.table.setColWidth();

                sec_id = null;
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    ///search

    $('body').on('click', '.search_button', function () {
        if (screen.width > 1023) {

            // if (filterByFields()) {
            //     return false;
            // }

            /**/
            var search = $('.inpsearchgm1').val();

            if (search != '' && search.length > 0)
            {
                // clear filters
                var tableHead = document.querySelector('table.table-head');
                var filterInputs = tableHead.querySelectorAll('input.filter');

                if (filterInputs !== undefined && filterInputs !== null && filterInputs.length > 0)
                {

                    for (var i = 0; i <= filterInputs.length - 1; ++i) {

                        filterInputs[i].value = '';

                    }
                }

                var filterSelect = tableHead.querySelector('input.filter-select');

                if (filterSelect !== undefined && filterSelect !== null)
                {
                    filterSelect.value = '';
                }

            }
            /**/

            var search = $('.inpsearchgm1').val();

            // if (window.objFilters !== undefined && Array.isArray(window.objFilters)) {
            //     window.objFilters.forEach(function(item) {
            //         item.config.methodParams = '?typeField=' + item.searchField.getAttribute('data-name') + '&search=' + search;
            //     });
            // }

            if (search != '') {
                $.ajax({
                    url: '/local/ajax/search.php',
                    type: 'post',
                    data: {
                        search: search
                    },
                    success: function (data) {
                        $('.table-cat tbody tr').remove();
                        $('.table-cat tbody').append(data);

                        window.wmc.table.setColWidth();

                        $('.filter').attr('data-section_id', 'search');
                        //console.log('work');
                        // подсчет колличества
                        var loadedElement = [];
                        $('#grid tbody tr').each(function () {
                            loadedElement.push(1);
                        });
                        var sumElements = loadedElement.length;
                        var elements = $('.hidden-count_sum').val();
                        if (!elements) {
                            $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + sumElements);
                        } else {
                            $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + elements);
                        }

                        // запись в историю (можно удалить, подтягиваеться с БД)
                        /*var history_value = $('.inpsearchgm1').val();
                        $.ajax({
                            url: '/local/ajax/page.php',
                            type: 'post',
                            data: {
                                history: history_value
                            },
                            success: function (data) {
                                //console.log(data);
                            },
                            error: function (error) {
                                //console.log(error);
                            }

                        });*/


                    },
                    error: function (error) {
                        console.log(error);
                    }

                });

            } else {
                location.href = '/';
            }

        } else {
            /// mobile_search
            var search = $('.inpsearchgm').val();
            $.ajax({
                url: '/local/ajax/mobile_catalog.php',
                type: 'post',
                data: {
                    mobile_search: search
                },
                success: function (data) {
                    $('.table-cat tbody tr').remove();
                    $('.table-cat tbody').append(data);

                    window.wmc.table.setColWidth();

                },
                error: function (error) {
                    console.log(error);
                }

            });
        }

    });

    // подгрузка товаров аякс

    $(document).ready(function ($) {
        if (screen.width > 1023) {
            $('.table-cat').scroll(function (e) {


                if (window.wmc.TTFF) return;


                var scrollCat = $('.table_scroll');
                var need_height = $(scrollCat).height() - +$(this).height() - 10;
                //var section_id = $('.two-row').data('section_id');
                //var section_id = $('.sort').data('section_id');
                var section_id = document.querySelector('.sort').dataset.section_id;
                var pages = $('.hidden-count:last').val();
                var count_pages = $('.count_goods').data('count_page');
                //  console.log(need_height);
                if ($(this).scrollTop() > need_height) {


                    var loadedElementCount = [];
                    $('#contTBgmTopTable table tbody tr').each(function () {
                        loadedElementCount.push(1);
                    });

                    var sumElementsCount = loadedElementCount.length;


                    if ((helCounSum = document.querySelector('.hidden-count_sum')) !== null) {
                        var countLoadedElement = helCounSum.value;
                    }
                    else {
                        return false;
                    }

                    if (parseInt(countLoadedElement) == parseInt(sumElementsCount)) {
                        return false;
                    }


                    if (window['NEED_HEIGHT'] === need_height) {
                        return false;
                    }
                    window['NEED_HEIGHT'] = need_height;

                    if (filterByFields({LOAD_ITEMS: true})) {
                        return false;
                    }

                    window.wmc.TTFF = true;
                    pages++;

                    if (section_id == 'search') return;

                    var countElements = parseInt($('#grid .hidden-count_sum:last').val());

                    if (countElements > parseInt(sumElementsCount))
                    {

                        $.ajax({
                            url: '/local/ajax/catalog.php',
                            type: 'post',
                            data: {
                                ajax_load: section_id,
                                count_page: count_pages,
                                pages: pages,
                                count: sumElementsCount
                            },
                            success: function (data) {
                                // $('#num_page').text(data.page);
                                $('.table-cat tbody').append(data);

                                var loadedElement = [];
                                $('#grid tbody tr').each(function () {
                                    loadedElement.push(1);
                                });
                                var sumElements = loadedElement.length;

                                var elements = $('.hidden-count_sum').val();
                                // var elements = $('.tovar:first').data('count_sum');
                                if (!elements) {
                                    $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + elements);
                                } else {
                                    $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + elements);
                                }


                                $('.order').each(function () {

                                    if ($(this).hasClass('visible')) {
                                        var id_order = $(this).data('id');
                                        $('.tab-tabl[data-order=' + id_order + '] tbody tr').each(function () {
                                            var order_goods = $(this).data('id');
                                            $('.tovar[data-id=' + order_goods + ']').addClass('color-lgt_green');
                                        });
                                    }

                                });

                                window.wmc.TTFF = false;

                            },
                            error: function (error) {
                                console.log(error);
                            }

                        });
                    }

                }
            });

        } else { /// for mobile

            $('.table-cat').scroll(function (e) {
                if (window.wmc.TTFF) return;


                var scrollCat = $('.table_scroll1');
                var need_height = $(scrollCat).height() - +$(this).height() - 10;
                //var section_id = $('.two-row').data('section_id');
                //var section_id = $('.sort').data('section_id');
                var section_id = document.querySelector('.sort').dataset.section_id;
                var pages = $('.hidden-count:last').val();
                var count_pages = $('.count_goods').data('count_page');

                if ($(this).scrollTop() > need_height) {

                    window.wmc.TTFF = true;
                    pages++;

                    if (section_id == 'search') return;
                    if (isNaN(pages)) return;
                    $.ajax({
                        url: '/local/ajax/mobile_catalog.php',
                        type: 'post',
                        data: {
                            ajax_load: section_id,
                            count_page: count_pages,
                            pages: pages
                        },
                        success: function (data) {
                            // $('#num_page').text(data.page);
                            $('.table-cat tbody').append(data);

                            var loadedElement = [];
                            $('#grid tbody tr').each(function () {
                                loadedElement.push(1);
                            });
                            var sumElements = loadedElement.length;
                            var elements = $('.hidden-count_sum').val();
                            if (!elements) {
                                $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + sumElements);
                            } else {
                                $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + elements);
                            }


                            $('.order').each(function () {
                                if ($(this).hasClass('visible')) {
                                    var id_order = $(this).data('id');
                                    $('.tab-tabl[data-order=' + id_order + '] tbody tr').each(function () {
                                        var order_goods = $(this).data('id');
                                        $('.tovar[data-id=' + order_goods + ']').addClass('color-lgt_green');
                                    });

                                }
                            });

                            window.wmc.TTFF = false;

                        },
                        error: function (error) {
                            console.log(error);
                        }

                    });
                }
            });

        }
     });
    ///
    $('body').on("click", ".print", printOrder);

    function printOrder() {
        var orderId = $("body").find(".tabset .visible").data("id");
        window.open("/local/ajax/printOrder.php?orderId=" + orderId + "&print=Y");
        return false;
    }

    ///при клике на область с вопросительным знаком под табами заказов создаем поле вводе, и в нем редактируем содержимое
    var titl_bot = false;

    //// здесь, при клике смотрим какие товары в корзине, и подсвечиваем соответствующие в каталоХе
    $('body').on('click', '.order', function () {
        var order_id = $(this).data('id');
        $('.order').each(function () {

            if ($(this).hasClass('visible')) {
                var id_order = $(this).data('id');
                var check_empty = $('.tab-tabl[data-order=' + id_order + '] tbody tr td span').text();
                if (check_empty == '') {
                    $('.tovar').removeClass('color-lgt_green');
                }
                ////  очистим
                var goods = $('.tab-tabl[data-order=' + id_order + '] tbody tr');
                //  console.log(goods);
                $('.tab-tabl[data-order=' + id_order + '] tbody tr').each(function () {
                    //console.log($(this));
                    $('.tovar').removeClass('color-lgt_green');
                });
                $('.tab-tabl[data-order=' + id_order + '] tbody tr').each(function () {
                    var order_goods = $(this).data('id');
                    var name = $('.tab-tabl[data-order=' + id_order + '] tbody tr td span').text();
                    if (order_id == id_order) {
                        $('.tovar[data-id=' + order_goods + ']').addClass('color-lgt_green');
                    }
                });
            }

        });

    });


    /// bonus default
    $('.order').each(function () {

        if ($(this).hasClass('visible')) {
            var id_order = $(this).data('id');
            var sum_bonus = [];
            var sum_price = [];
            $('.tab-tabl[data-order=' + id_order + '] tbody tr').each(function () {
                var $this = this;
                var order_bonus = parseFloat($this.dataset.bonus),
                    count_bonus,
                    count_good = parseInt($this.dataset.quantity_good);
                var price_good = parseFloat($this.dataset.price);
                var  new_good = parseFloat($this.dataset.new);
                var precent_bonus = price_good * (order_bonus / 100);

                if(new_good != 0){
                    count_bonus = precent_bonus  * count_good * new_good;
                }else{
                    count_bonus = precent_bonus  * count_good;
                }
                sum_bonus.push(count_bonus);
                var sum_good = parseInt($this.dataset.quantity_good),
                    good_price = parseInt($this.dataset.price),
                    count_sum_good = good_price * sum_good;
                sum_price.push(count_sum_good);
            });

            var total_sum = 0,
                total_sum_price = 0;
            for (var i = 0; i < sum_bonus.length; i++){
                total_sum += sum_bonus[i];
            }

            for (var i = 0; i < sum_price.length; i++){
                total_sum_price += sum_price[i];
            }

        }

    });

    //// смотрим активный заказ, и отображаем его на мобильной версии
    var active_order = document.querySelector('.tabset .visible span').textContent;
    document.querySelector('.click-zakaz').textContent = active_order;

    $('body').on('click', '.row-line', function (e) {
        var divs = document.querySelectorAll('.zakaz-list .row-line');

        if (divs) {
            Array.prototype.forEach.call(divs, function (item) {
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                }
            });
            e.target.closest('.zakaz-list .row-line').classList.add('active');
            document.querySelector('.row input[type="radio"]').setAttribute('checked', 'checked');
        }

    });


});

function getSearch() {
    if (screen.width > 1023) {

        if (filterByFields()) {
            return false;
        }

        var search = $('.inpsearchgm1').val();

        if (window.objFilters !== undefined && Array.isArray(window.objFilters)) {
            window.objFilters.forEach(function(item) {
                item.config.methodParams = '?typeField=' + item.searchField.getAttribute('data-name') + '&search=' + search;
            });
        }

        if (search != '') {
            $.ajax({
                url: '/local/ajax/search.php',
                type: 'post',
                data: {
                    search: search
                },
                success: function (data) {
                    $('.table-cat tbody tr').remove();
                    $('.table-cat tbody').append(data);

                    window.wmc.table.setColWidth();
                    $('.filter').attr('data-section_id', 'search');
                    //console.log('work');
                    // подсчет колличества
                    var loadedElement = [];
                    $('#grid tbody tr').each(function () {
                        loadedElement.push(1);
                    });
                    var sumElements = loadedElement.length;
                    var elements = $('.hidden-count_sum').val();
                    if (!elements) {
                        $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + sumElements);
                    } else {
                        $('.count_goods span').text('Просмотр 1 - ' + sumElements + ' из ' + elements);
                    }

                    /// запись в историю
                    var history_value = $('.inpsearchgm1').val();
                    $.ajax({
                        url: '/local/ajax/page.php',
                        type: 'post',
                        data: {
                            history: history_value
                        },
                        success: function (data) {
                            //console.log(data);
                        },
                        error: function (error) {
                            //console.log(error);
                        }

                    });


                },
                error: function (error) {
                    console.log(error);
                }

            });

        } else {
            location.href = '/';
        }

    } else {
        /// mobile_search
        var search = $('.inpsearchgm').val();
        $.ajax({
            url: '/local/ajax/mobile_catalog.php',
            type: 'post',
            data: {
                mobile_search: search
            },
            success: function (data) {
                $('.table-cat tbody tr').remove();
                $('.table-cat tbody').append(data);

                window.wmc.table.setColWidth();

            },
            error: function (error) {
                console.log(error);
            }

        });
    }
}

var cloneXHRSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function ()
{
    var self = this;
    var centerContainer = document.querySelector('.catalog-container');

    self.addEventListener('load', function (e) {
        clearTimeout(self.timerIdForLoader);

        if (self.timerIdForLoaderArray instanceof Array && self.timerIdForLoaderArray.length > 0)
        {
            for (var i = 0; self.timerIdForLoaderArray.length > i; i++) {

                clearTimeout(self.timerIdForLoaderArray[i]);
            }

            self.timerIdForLoaderArray = new Array();
        }

        centerContainer !== null && centerContainer.classList.contains('loader') && centerContainer.classList.remove('loader');

        var containerhasLoader = document.querySelector('.loader');
        containerhasLoader !== null && containerhasLoader.classList.remove('loader');
    });

    self.timerIdForLoader = setTimeout (function () {
        centerContainer !== null && !centerContainer.classList.contains('loader') && centerContainer.classList.add('loader');
    }, 700);

    if (self.timerIdForLoaderArray === undefined || self.timerIdForLoaderArray === null)
    {
        self.timerIdForLoaderArray = new Array();
    }

    self.timerIdForLoaderArray.push(self.timerIdForLoader);

    cloneXHRSend.apply(self, arguments);
};