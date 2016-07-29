(function() {
	var selectedTarget = null;
    this.DatePicker = function(obj) {
		var _this = this;
		this.config = obj;
		this.days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
		this.fullDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        this.months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		this.fullMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        this.currentInfo = {date:null,month:null,year:null};
		this.forSetDate = new Date();
		this.maxYear = this.forSetDate.getFullYear() + 100;
		this.minYear = this.forSetDate.getFullYear() - 100;
		this.minMaxMonth = this.forSetDate.getMonth();
		this.dateArray = [];
        this.isLeftArrowEnabled = true; 		
		this.isRightArrowEnabled = true;
		this.displayView = {day: true,month: false,year: false};
		this.config.target.addEventListener("click", function(){
			var isShow = _this.getDtpShowStatus(_this.config.target);
			if(isShow) {
				_this.config.target.blur();
			    _this.createHtmlContent();
			}
			else{
				_this.closeDatePicker(_this);
			}
		});
	}
	
	DatePicker.prototype.getDtpShowStatus = function(targetElement) {
		var isShow = true;
		var findDom = document.getElementsByClassName("datepicker_parent_container");
		for(var j = 0;j < findDom.length;j++) {	
            findDom[j].remove();
			isShow = false;
		}
		if(selectedTarget != targetElement.id) {
			isShow = true;
			selectedTarget = targetElement.id;
		}
		return isShow;
	}
	
	DatePicker.prototype.createHtmlContent = function() {
		this.parentElement = this.createElementDynamic("div",{"class":"datepicker_parent_container"});
		this.isValidDate(this.config.target.value);
		var datePickerHeader = this.createDatePickerHeader();
		var dateTable = this.createDateTable();
		this.parentElement.appendChild(datePickerHeader);
		this.parentElement.appendChild(dateTable);
		this.positionDatePickerStyle(this.parentElement);
		document.body.appendChild(this.parentElement); 
		this.onClickDatePicker();
		this.validateMinMaxDate();
	}
	
	/** Desc: Create the datepicker header part
    *   Param: Null
    *   Return:
    */ 	
	DatePicker.prototype.createDatePickerHeader = function() {
		var this_ = this;
		var parentElement = this.createElementDynamic("div",{"class":"dtp_datepicker_header_class"});
		var parentLeftElement = this.createElementDynamic("div",{"class":"dtp_datepicker_headerleft"});
		var parentCenterElement = this.createElementDynamic("div",{"id":"dtp_container_title","class":"dtp_datepicker_headercenter"});
		this.setHeaderTitle(parentCenterElement);
		var parentRightElement = this.createElementDynamic("div",{"class":"dtp_datepicker_headerright"});
		var parentLeftArrowElement = this.createElementDynamic("span",{"id":"dtp_header_left_arrow","class":"dtp_header_leftarrow"});
		parentLeftArrowElement.addEventListener('click', function(event) {
			if(this_.isLeftArrowEnabled) {
				this_.handlingArrowClick(false);
			}
        });
		parentLeftArrowElement.appendChild(this.createTextNodeDynamic("<"));
		var parentRightArrowElement = this.createElementDynamic("span",{"id":"dtp_header_right_arrow","class":"dtp_header_rightarrow"});
		parentRightArrowElement.addEventListener('click', function(event) {
			if(this_.isRightArrowEnabled) {
                this_.handlingArrowClick(true);
			}
		});
		parentRightArrowElement.appendChild(this.createTextNodeDynamic(">"));
		parentLeftElement.appendChild(parentLeftArrowElement);
		parentRightElement.appendChild(parentRightArrowElement);
		parentElement.appendChild(parentLeftElement);
		parentElement.appendChild(parentCenterElement);
		parentElement.appendChild(parentRightElement);
		return parentElement;
	}
	
	DatePicker.prototype.handlingArrowClick = function(flag) {
		if(this.displayView.day) {
		    this.updateDatePicker(flag);
		}
		else if(this.displayView.month) {
			this.nextPrevYear(flag,1);
			this.setHeaderTitle();
			this.buildMonthViewBody();
		}
		else {
			this.nextPrevYear(flag,16);
			this.setHeaderTitle();
			this.buildYearViewContent();
		}
		this.validateMinMaxDate();
	}
	
	DatePicker.prototype.nextPrevYear = function(flag,totalyears) {
		if(flag){
			this.updateCurrentInfo({year:this.currentInfo.year + totalyears});
		}
		else{
			this.updateCurrentInfo({year:this.currentInfo.year - totalyears});
		}
	}
	
	DatePicker.prototype.createDateTable = function() {
		var table = this.createElementDynamic("table");
		var tableHeader = this.createElementDynamic("thead");
		var headerColumn = this.createHeader();
		var bodyColumn = this.createDatePickerBody();
		tableHeader.appendChild(headerColumn);
		table.appendChild(tableHeader);
		table.appendChild(bodyColumn);
		return table;
	}
	
	DatePicker.prototype.createHeader = function() {
		var this_ = this;
		var tableRow = this.createElementDynamic("tr");
		var weekDays = this.days;
		var weekDaysLen = weekDays.length;
		for(var i = 0; i < weekDaysLen; i++) {
			var textNode = this_.createTextNodeDynamic(weekDays[i]);
			var tableColumn = this_.createElementDynamic("td");
		    tableColumn.appendChild(textNode);
		    tableRow.appendChild(tableColumn);
		}
		return tableRow;
	}
	
	DatePicker.prototype.createDatePickerBody = function() {
		var this_ = this;
		var totalDaysInCurrentMonth = this.getCurrentMonthTotalDays(this.currentInfo.year,this.currentInfo.month);
		var currentMonthView = this.buildCurrentMonthArray(totalDaysInCurrentMonth);
		var tableBody = this.createElementDynamic("tbody",{"id":"dtp_tablebody"});
		var dateArrayLen = this.dateArray.length;
		var tableRow = this.createElementDynamic("tr");
		for(var i = 0; i < dateArrayLen; i++) {
			var curObj = this_.dateArray[i];
			var tableColumn = this_.createElementDynamic("td");
			tableColumn.className = curObj.clsName;			
			var textNode = this_.createTextNodeDynamic(curObj.value);
		    tableColumn.appendChild(textNode);
		    if(i != 0 && i % 7 == 0) {
				tableBody.appendChild(tableRow);
				tableRow = this_.createElementDynamic("tr");
			}
			tableRow.appendChild(tableColumn);
		}
		tableBody.appendChild(tableRow);
		return tableBody;
	}
	
	DatePicker.prototype.buildCurrentMonthArray = function(currentMonthDays) {
		this.dateArray = [];
		//for current month dates
		this.setDateMonthYear(this.currentInfo.year, this.currentInfo.month,1);
		var startDay = this.currentDay();
		this.setDateMonthYear(this.currentInfo.year, this.currentInfo.month,currentMonthDays);
		var endDay = this.currentDay();
		// previous month dates
		if(startDay > 0) {
			this.setDateMonthYear(this.currentInfo.year, this.currentInfo.month,1);
			this.subtractDays(startDay);
			var prevMonthStart = this.currentDate();
			var prevMonthEnd = this.getCurrentMonthTotalDays(this.currentYear(),this.currentMonth());
			this.addDays(startDay);
		}
		// Future month dates
		if(endDay < 6) {
			this.setDateMonthYear(this.currentInfo.year, this.currentInfo.month,currentMonthDays);
			var nextMonthStart = 1;
			var nextMonthEnd = 6 - endDay;
		}
		this.loopByIndex(prevMonthStart,prevMonthEnd,"not-current-month");
		this.loopByIndex(1,currentMonthDays,"dtp-current-month");
		this.loopByIndex(nextMonthStart,nextMonthEnd,"not-current-month");
	}
	
	DatePicker.prototype.loopByIndex = function(start,end,className) {
		var this_ = this;
		for(start; start <= end; start++) {
			var obj = {value: start,clsName: className};
			if(className == "dtp-current-month" && this_.currentInfo.date == start &&
			this_.currentInfo.month == this_.selectedInfo.month && this_.currentInfo.year == this_.selectedInfo.year) {
				obj.clsName = "dtp-current-day";
			}
			this_.dateArray.push(obj);
		}
	}
	
	DatePicker.prototype.currentDate = function() {
		return this.forSetDate.getDate();
	}
	
	DatePicker.prototype.currentDay = function() {
		return this.forSetDate.getDay();
	}
	
	DatePicker.prototype.currentMonth = function() {
		return this.forSetDate.getMonth();
	}
	
	DatePicker.prototype.currentYear = function() {
		return this.forSetDate.getFullYear();
	}
	
	DatePicker.prototype.getCurrentMonthTotalDays = function(year,month) {
		// month start from 1, month parameter is start from 0
		return new Date(year, month+1, 0).getDate();
	}
	
	DatePicker.prototype.setDateMonthYear = function(year,month,date) {
		this.forSetDate.setDate(date);
		this.forSetDate.setMonth(month);
		this.forSetDate.setFullYear(year);
	}
	
	DatePicker.prototype.setOnlyDate = function(element,cb) {
		this.forSetDate.setDate(element.innerHTML);
		this.config.target.value = this.forSetDate; 
		if(this.config.callback) {
			this.config.callback(this.forSetDate);
		}		
		if(cb) {
			cb(this);
		}
	}
	
	DatePicker.prototype.addDays = function(days) {
		this.forSetDate.setDate(this.forSetDate.getDate() + days);
	}
	
	DatePicker.prototype.subtractDays = function(days) {
		this.forSetDate.setDate(this.forSetDate.getDate() - days);
	}
	
	DatePicker.prototype.updateCurrentInfo = function(curDateObj) {
		if(curDateObj.date != undefined) {
			this.currentInfo.date = curDateObj.date;
		}
		if(curDateObj.month != undefined) {
			this.currentInfo.month = curDateObj.month;
		}
		if(curDateObj.year != undefined) {
			this.currentInfo.year = curDateObj.year;
		}
		this.setDateMonthYear(this.currentInfo.year, this.currentInfo.month, this.currentInfo.date);
	}
	
	DatePicker.prototype.isValidDate = function(targetValue) {
		var seletedDate = new Date();
		if(targetValue != "" && targetValue != undefined && targetValue != null) {
			seletedDate = new Date(targetValue);
			if(seletedDate == "Invalid Date") {
				seletedDate = new Date();
			}
		}
		this.selectedInfo = {date: seletedDate.getDate(),month:seletedDate.getMonth(),year:seletedDate.getFullYear()};
		this.updateCurrentInfo(this.selectedInfo);
		this.updateDisplayView(true,false,false);
		this.isLeftArrowEnabled = true; 		
		this.isRightArrowEnabled = true;
	}
	
	DatePicker.prototype.updateDatePicker = function(flag) {
		// if flag is true , it is next month otherwise previous month
		if(flag) {
		    if(this.currentInfo.month == 11){
			   	this.updateCurrentInfo({month:0, year:this.currentInfo.year + 1});
			}
			else {
				this.updateCurrentInfo({month:this.currentInfo.month + 1});
			}
		}
		else {
			if(this.currentInfo.month == 0)	{
			    this.updateCurrentInfo({month:11, year:this.currentInfo.year - 1});
			}
			else {
				this.updateCurrentInfo({month:this.currentInfo.month - 1});
			}
		}
		this.renderDateView();
	}
	
	DatePicker.prototype.renderDateView =function() {
		this.setHeaderTitle();
		document.getElementById("dtp_tablebody").innerHTML = this.createDatePickerBody().innerHTML;
		this.onClickDatePicker();
	}
	
	DatePicker.prototype.renderMonthView =function() {
		this.setHeaderTitle();
		this.buildMonthViewBody();
	}
		
	DatePicker.prototype.onClickDatePicker =function() {
		var _this = this;
		var selectDate = document.getElementsByClassName("dtp-current-month");
		var currentDate = document.getElementsByClassName("dtp-current-day");
		
		for(var j = 0;j<currentDate.length;j++) {	
            currentDate[j].addEventListener("click", function(){
                _this.setOnlyDate(this,_this.closeDatePicker);
		    });		
		}
		
		for(var i = 0;i<selectDate.length;i++) {		
		    selectDate[i].addEventListener("click", function(){
                _this.setOnlyDate(this,_this.closeDatePicker);
		    });
		}
	 }
	
	DatePicker.prototype.closeDatePicker = function(_this) {
		if(_this.parentElement) {
		    _this.parentElement.remove();
		    _this.parentElement = null;
		}
	}
	
	/** Desc: Create element dynamically
    * param1: elementName string (name of the element - div,span....)
	* param2: objAttr object (Attributes for the element- id,class...) 
    * return: html element
    */
    DatePicker.prototype.createElementDynamic = function(elementName,objAttr) {
		var element = document.createElement(elementName);
		for(var key in objAttr){
			element.setAttribute(key, objAttr[key]);
		}
		return element;
	}
	
	DatePicker.prototype.createTextNodeDynamic = function(text) {
		var textNode = document.createTextNode(text);
		return textNode;
	}
	
	DatePicker.prototype.positionDatePickerStyle = function(element) {
		element.style.left = this.config.target.offsetLeft + this.config.target.offsetWidth +"px";
        element.style.top = this.config.target.offsetTop +"px";
    }
	
	// minimum year = current year - 100, maximum year = current year + 100 
	DatePicker.prototype.validateMinMaxDate = function() {
		if(this.currentInfo.year >= this.maxYear && this.currentInfo.month == this.minMaxMonth ) {
		    document.getElementById("dtp_header_right_arrow").setAttribute("class","dtp_header_rightarrow dtp-disable-arrow");
			this.isRightArrowEnabled = false;
		}
		else {
			if(!this.isRightArrowEnabled) {
				this.isRightArrowEnabled = true;
				document.getElementById("dtp_header_right_arrow").setAttribute("class","dtp_header_rightarrow");
			}
		}
		
		if(this.currentInfo.year <= this.minYear && this.currentInfo.month == this.minMaxMonth ) {
		    document.getElementById("dtp_header_left_arrow").setAttribute("class","dtp_header_leftarrow dtp-disable-arrow");
			this.isLeftArrowEnabled = false;
		}
		else {
			if(!this.isLeftArrowEnabled) {
				this.isLeftArrowEnabled = true;
				document.getElementById("dtp_header_left_arrow").setAttribute("class","dtp_header_leftarrow");
			}
		}
		
		if(this.displayView.month || this.displayView.year) {
			if(this.currentInfo.year >= this.maxYear) {
		        document.getElementById("dtp_header_right_arrow").setAttribute("class","dtp_header_rightarrow dtp-disable-arrow");
			    this.isRightArrowEnabled = false;
		    }
		    else {
			    if(!this.isRightArrowEnabled) {
				    this.isRightArrowEnabled = true;
				    document.getElementById("dtp_header_right_arrow").setAttribute("class","dtp_header_rightarrow");
			    }
		    }
		
		    if(this.currentInfo.year <= this.minYear ) {
		        document.getElementById("dtp_header_left_arrow").setAttribute("class","dtp_header_leftarrow dtp-disable-arrow");
			    this.isLeftArrowEnabled = false;
		    }
		    else {
			    if(!this.isLeftArrowEnabled) {
				    this.isLeftArrowEnabled = true;
				    document.getElementById("dtp_header_left_arrow").setAttribute("class","dtp_header_leftarrow");
			    }
		    }
		}
	}
	
	DatePicker.prototype.appendMonthYearHtml = function(clickedElement) {
		var titleArr = clickedElement.innerHTML.split(" ");
		if(titleArr.length == 2) {
			this.updateDisplayView(false,true,false);
		    this.buildMonthViewBody();
		}
		else if(titleArr.length == 1) {
			this.updateDisplayView(false,false,true);
			this.buildYearViewContent(this.currentYear());
		}
		this.validateMinMaxDate();
		this.setHeaderTitle();
		this.showTableHeader(false);
	}
	
	DatePicker.prototype.updateDisplayView = function(isDay,isMonth,isYear) {
		this.displayView.day = isDay;
		this.displayView.month = isMonth;
		this.displayView.year = isYear;
	}
	
	DatePicker.prototype.buildMonthViewBody = function() {
		var this_ = this;
		var tableBody = this.createElementDynamic("tbody");
		var monthArrayLen = this.months.length;
		var tableRow = null;
		for(var i = 0; i < monthArrayLen; i++) {
			var curMon = this_.months[i];
			var tableColumn = this_.createElementDynamic("td",{"class":"bb-dtp-month"});
			if(i == this_.selectedInfo.month && this_.selectedInfo.year == this_.currentInfo.year){
				tableColumn = this_.createElementDynamic("td",{"class":"bb-dtp-month bb-current-month-selected"});
			}
			if((this_.maxYear == this_.currentInfo.year && i > this_.minMaxMonth) || 
			(this_.minYear == this_.currentInfo.year && i < this_.minMaxMonth)){
				tableColumn = this_.createElementDynamic("td",{"class":"bb-dtp-month-disable"});
			}
			tableColumn.setAttribute("data-month",i);
			var textNode = this_.createTextNodeDynamic(curMon);
		    tableColumn.appendChild(textNode);
		    if(i % 3 == 0) {
				tableRow = this_.createElementDynamic("tr");
			}
			tableRow.appendChild(tableColumn);
			if((i + 1) % 3 == 0) {
			    tableBody.appendChild(tableRow);
			}
		}
		document.getElementById("dtp_tablebody").innerHTML = tableBody.innerHTML;
		this.addEventListenerDynamicMonth();
	}
	
	DatePicker.prototype.buildYearViewContent = function() {
		var this_ = this;
		var tableBody = this.createElementDynamic("tbody");
		var startYear = this.currentYear();
		var tableRow = null;
		for(var i = 0; i < 16; i++) {
			var curMon = this_.months[i];
			var tableColumn = this_.createElementDynamic("td",{"class":"bb-dtp-year"});
			if((startYear + i) == this_.selectedInfo.year){
				tableColumn = this_.createElementDynamic("td",{"class":"bb-dtp-year bb-current-year-selected"});
			}
			if( (startYear + i) > this_.maxYear || (startYear + i) < this_.minYear){
				tableColumn = this_.createElementDynamic("td",{"class":"bb-dtp-year-disable"});
			}
			tableColumn.setAttribute("data-year",startYear + i);
			var textNode = this_.createTextNodeDynamic(startYear + i);
		    tableColumn.appendChild(textNode);
		    if(i % 4 == 0) {
				tableRow = this_.createElementDynamic("tr");
			}
			tableRow.appendChild(tableColumn);
			if((i + 1) % 4 == 0) {
			    tableBody.appendChild(tableRow);
			}
		}
		document.getElementById("dtp_tablebody").innerHTML = tableBody.innerHTML;
		this.addEventListenerDynamicYear();
	}
		
	DatePicker.prototype.showTableHeader = function(flag) {
		var dtpHtml = document.getElementsByClassName("datepicker_parent_container");
		if(dtpHtml.length > 0) {
			var tableHeadEle = dtpHtml[0].getElementsByTagName("thead");
			if(flag) {
		        tableHeadEle[0].style.display = "";	
		    }
		    else {
			    tableHeadEle[0].style.display = "none";	
		    }
		}
	}
	
	DatePicker.prototype.setHeaderTitle = function(element) {
		var this_ = this;
		var titleElement = element || document.getElementById("dtp_container_title");
		titleElement.innerHTML = null;
		var parentheaderDataElement = this.createElementDynamic("span",{});
		var titleText = this.fullMonths[this.currentMonth()]+" "+ this.currentYear();
		if(this.displayView.month){
			titleText = this.currentYear();
		}
		else if(this.displayView.year) {
			titleText = (this.currentYear())+"-"+((this.currentYear()+15));
		}
		parentheaderDataElement.appendChild(this.createTextNodeDynamic(titleText));
		if(!this.displayView.year){
		    parentheaderDataElement.addEventListener('click', function(event) {
			    this_.appendMonthYearHtml(this);
		    });
		}
		titleElement.appendChild(parentheaderDataElement);
	}
	
	DatePicker.prototype.addEventListenerDynamicMonth = function() {
		var _this = this;
		var allMonths = document.getElementsByClassName("bb-dtp-month");
		for(var j = 0;j<allMonths.length;j++) {	
		    allMonths[j].addEventListener("click", function(){
				_this.updateCurrentInfo({month:Number(this.getAttribute("data-month"))});
				_this.updateDisplayView(true,false,false);
                _this.renderDateView();
				_this.validateMinMaxDate();
				_this.showTableHeader(true);
		    });		
		}
	}
	
	DatePicker.prototype.addEventListenerDynamicYear = function() {
		var _this = this;
		var allElements = document.getElementsByClassName("bb-dtp-year");
		for(var j = 0;j<allElements.length;j++) {	
		    allElements[j].addEventListener("click", function(){
				_this.updateCurrentInfo({year:Number(this.getAttribute("data-year"))});
				_this.updateDisplayView(false,true,false);
                _this.renderMonthView();
				_this.validateMinMaxDate();
				_this.showTableHeader(false);
		    });		
		}
	}
	
	document.body.addEventListener('keyup', function(event) { 
        if(event.keyCode == 27){
		    var findDom = document.getElementsByClassName("datepicker_parent_container");
		    for(var j = 0;j < findDom.length;j++) {	
                findDom[j].remove();
			}
	    }
    });
	
	document.body.addEventListener('click', function(event) { });
}());

