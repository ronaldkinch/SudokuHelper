// Sudoku Helper
$(function () {
  // global variables
  var $setup = $('#setup');
  var $size = $('#size');
  var $start = $('#start');
  var $custom = $('#custom');
  var $entry = $('#entry');
  var $x = $('#x');
  var $y = $('#y');
  var $charSet = $('#charSet');
  var $error = $('#error');
  var $save = $('#save');
  var $puzzle = $('#puzzle');
  var $grid = $('#grid');
  var $assist = $('.assist');

  var blankLine = '';
  var blankChar = String.fromCodePoint(160);
  var blockChar = String.fromCodePoint(9608);
  var cellStr = '123456789abcdef0';
//  var cellStr = '123456789abcdefghijklmnopqrstuvwxyz0';
  var sizeX = 3;
  var sizeY = 3;
  var cellLen = 9;

  var dataGrp = [[],[],[]];
  var assistFlag = [false, false, false];
  var assistAide = [];

  $setup.show(); // After Javascript confirmed

  // setup
  $custom.on('click', function() {
    $x.val(sizeX);
    $y.val(sizeY);
    $charSet.val(cellStr);
    $setup.hide();
    $entry.show();
  });

  // entry
  function isSizeError(num) {return !(2<=num&&num<=8);}
  function isCharError(str) {
    for (var i = 0; i < str.length; i++) {
      if (str.indexOf(str[i])!=str.lastIndexOf(str[i])) {
        return true;}
    }
    return false;}

  $('input').on('click', function() {this.select();});

  $save.on('click', function() {
    $elError = $error.css('margin-right', 'auto');
    sizeX = $x.val();
    sizeY = $y.val();
    cellStr = $charSet.val();
    if (isSizeError(sizeX) || isSizeError(sizeY)) {
      $elError.text(
        'Each size must be a number from 2 to 8');
    } else if (isCharError(cellStr)) {
      $elError.text(
        'Each character in the set must be unique');
    } else if (sizeX*sizeY > cellStr.length) {
      $elError.text(
        'The size product can not be more' +
          ' than the character set length (max 16)');
    } else {
      $elError.css('margin-right', '200%');
      $size.text(
        'Size:( ' + sizeX + ' by ' + sizeY + ' )');
      $setup.show();
      $entry.hide();
    }
  });

  // start
  $start.on('click', function() {
    cellLen = sizeX * sizeY;
    cellStr = cellStr.substr(0, cellLen);
    $setup.hide();
    $entry.hide();
    $puzzle.show();
    createGrid();
  });

  // grid
  function createGrid() {
    // function variables
    for (var i = 0; i < cellLen; i++) {
      blankLine += blankChar;
      dataGrp[0][i] = '[data-blk=' + i + ']';
      dataGrp[1][i] = '[data-col=' + i + ']';
      dataGrp[2][i] = '[data-row=' + i + ']';
    }

    // create cell template
    var cellSize = Math.ceil(Math.sqrt(cellLen));
    var $cell = $('.cell').attr('data-size', cellSize);
    $('.cellBack').text(cellStr);
    $('.cellMask2').text(blankLine);
    $('.cellMask1').text(blankLine);

    // creation loops
    for (var innerX = 0; innerX < sizeX; innerX++) {
      $grid.append('<tr class="blk"></tr>');
      for (var innerY = 0; innerY < sizeY; innerY++) {
        var blk = innerY + innerX * sizeY;
        $('.blk:last').append('<td><table></table></td>');
        for (var outerY = 0; outerY < sizeY; outerY++) {
          $('table:last').append('<tr></tr>');
          for (var outerX = 0; outerX < sizeX; outerX++) {
            var col = outerX + innerY * sizeX;
            var row = outerY + innerX * sizeY;
            var $clone = $cell.clone()
              .attr('data-blk', blk)
              .attr('data-col', col)
              .attr('data-row', row);
            $('tr:last').append($('<td></td>')
              .append($clone));
          }
        }
      }
    }
    $cell.detach();
  }

  // solve puzzle
  function arrayCells($cell) {
    var blk = dataGrp[0][$cell.data('blk')];
    var col = dataGrp[1][$cell.data('col')];
    var row = dataGrp[2][$cell.data('row')];
    return [blk, col, row];
  }

  function $groupCells($cell) {
    var array = arrayCells($cell);
    return $(array[0] + ',' + array[1] + ',' + array[2]);
  }

  function idCell($cell) {
    var array = arrayCells($cell);
    return (array[0] + ',' + array[1] + ',' + array[2]);
  }

  $grid.on('mouseenter', 'input', function() {
    $groupCells($(this.parentNode)).addClass('group');
    this.focus();
    this.click();
  });

  $grid.on('mouseleave', 'input', function() {
    $groupCells($(this.parentNode)).removeClass('group');
  });

  $grid.on('input', 'input', function() {
    var $cell = $(this.parentNode);
    var val = this.value;
    var clear = (val === ' ');
    var indx = cellStr.indexOf(val);

    this.value = '';
    if (indx >= 0 || clear) {
      var cellText = this.nextElementSibling;
      $cell.removeClass('error');
      if (cellText.textContent !== '') {
        cellText.textContent = '';
        reset_cellBack();
      }
      if (!clear) {
        cellText.textContent = val;
        isError_cellText($cell);
        clearChar(indx, $cell);
      }
    }
    assistant();
  });

  function reset_cellBack() {
    $('.cellBack').text(cellStr);
    $('.cell').each(function() {
      var $cell = $(this);
      var text = $cell.find('.cellText').text();
      var indx = cellStr.indexOf(text);
      if (indx >= 0 && text !== '') {
        clearChar(indx, $cell);
      }
    });
  }

  function isError_cellText($cell) {
    var cellId = idCell($cell);
    var text = $cell.find('.cellText').text();
    $groupCells($cell).each(function() {
      $this = $(this);
      if ((cellId != idCell($this)) &&
          (text == $this.find('.cellText').text())) {
        $cell.addClass('error');
      }
    });
  }

  function clearChar(indx, $cell) {
    if (!$cell.hasClass('error')) {
      $groupCells($cell).each(function() {
        var $cellBack = $(this).find('.cellBack');
        $cellBack.text($cellBack.text()
          .replace(cellStr[indx], blankChar));
      });
      $cell.find('.cellBack').text(blankLine);
    }
  }

  // option buttons
  $assist.one('click', function() {
    assistFlag[Number(this.textContent) - 1] = true;
    assistant();
  });

  function assistant() {
    for (var aide = 0; aide < 3; aide++) {
      for (var grp = 0; grp < 3; grp++) {
        for (var cel = 0; cel < cellLen; cel++) {
          if (assistFlag[aide]) {
            assistAide[aide]($(dataGrp[grp][cel]));
          }
        }
      }
    }
  }
/*      $('.cell').each(function() {
        var $cell = $(this);
        var cells = arrayCells($(this));
//        console.log(cells);
        arrayCells($(this)).forEach(function(group) {
//        cells.forEach(function(group) {
//          console.log(group);
          $group = $(group);
//          console.log($group);
          if (assistFlag[aide]) {assistAide[aide]()};
        })
        var text = $cell.find('.cellText').text();
        var indx = cellStr.indexOf(text);
        if (indx >= 0 && text !== '') {
  //        clearChar(indx, $cell);
        }
      });*/

  assistAide[0] = function($group) {
    console.log('assist0');
          console.log($group);
  };

  assistAide[1] = function($group) {
    console.log('assist1');
          console.log($group);
  };

  assistAide[2] = function($group) {
    console.log('assist2');
          console.log($group);
  };
});
