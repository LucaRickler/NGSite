function getPagina(url) {
  return $.ajax(url, {dataType : 'text'});
}


function prettyFloat(x,nbDec) { 
  if (!nbDec) nbDec = 100;
  var a = Math.abs(x);
  var e = Math.floor(a);
  var d = Math.round((a-e)*nbDec); if (d == nbDec) { d=0; e++; }
  var signStr = (x<0) ? "-" : " ";
  var decStr = d.toString(); var tmp = 10; while(tmp<nbDec && d*tmp < nbDec) {decStr = "0"+decStr; tmp*=10;}
  var eStr = e.toString();
  return signStr+eStr+"."+decStr;
}


class LicensesManager {
  
  constructor(price, class_n, class_n_label, price_val) {
    this.actual_number = 1;
    this.for_one_price = price;
    this.class_n = document.getElementById(class_n);
    this.class_n_label = document.getElementById(class_n_label);
    this.price_val = document.getElementById(price_val);
    this.load();
  }
  
  load() {
    this.actual_number = this.class_n.value;
    if(this.actual_number < 1) {
      this.actual_number = 1;
      this.class_n.value = this.actual_number;
    }
    this.class_n_label.innerHTML = this.actual_number+" Class"+(this.actual_number == 1 ? "e" : "i");
    var formatter = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    });
    this.price_val.innerHTML = "<var>Prezzo: "+formatter.format(this.actual_number * this.for_one_price)+"</var>";
    this.getOffertaConsigliata();
  }
  
  addClass() {
    this.actual_number++;
    this.class_n.value = this.actual_number;
    this.load();
  }
  
  removeClass() {
    this.actual_number--;
    if(this.actual_number < 1) {
      this.actual_number = 1;
    }
    this.class_n.value = this.actual_number;
    this.load();
  }
  
  getOffertaConsigliata() {
    var request = "?pr_id=2&cl_n="+this.actual_number;
    $.when(getPagina('/shop/tools/getPrices.php'+request))
      .then(function (response) {
      try {
        console.log(response);
        var innerHTML = '<div class="col">'+response+'</div>';
        document.getElementById('offerta_consigliata').innerHTML = innerHTML;
      } catch(err) {
        console.error(err.message);
      }
    });
  }
  
}


class TagCheckboxLabelManager {
  
  constructor(type) {
    this.type = type;
    this.checks = new Array();
    this.mostraTutti = null;
  }
  
  addCheck(id) {
    var n = document.getElementById(id);
    this.checks.push(n);
    n.onmousedown = function() {
      var role = $(this).attr('role');
      if($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).find('.fa').removeClass('fa-check-square-o');
        $(this).find('.fa').addClass('fa-square-o');
      } else {
        $('.tag-checkbox-label').each(function () {
          if($(this).attr('role') == "mostra-tutti") {
            $(this).removeClass('active');
            $(this).find('.fa').removeClass('fa-check-square-o');
            $(this).find('.fa').addClass('fa-square-o');
          }
        });
        $(this).addClass('active');
        $(this).find('.fa').removeClass('fa-square-o');
        $(this).find('.fa').addClass('fa-check-square-o');
      }
      tag_checkbox_label_manager.loadProductsFromTags();
    }
  }
  
  addMostraTutti(id) {
    this.mostraTutti = document.getElementById(id);
    this.mostraTutti.onmousedown = function() {
      if($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).find('.fa').removeClass('fa-check-square-o');
        $(this).find('.fa').addClass('fa-square-o');
      } else {
        $('.tag-checkbox-label').each(function () {
          if($(this).attr('role') != "mostra-tutti") {
            $(this).removeClass('active');
            $(this).find('.fa').removeClass('fa-check-square-o');
            $(this).find('.fa').addClass('fa-square-o');
          }
        });
        $(this).addClass('active');
        $(this).find('.fa').removeClass('fa-square-o');
        $(this).find('.fa').addClass('fa-check-square-o');
      }
      tag_checkbox_label_manager.loadProductsFromTags();
    }
  }
  
  loadProductsFromTags() {
    var selected_tags = new Array();
    if(this.mostraTutti != null && $('#'+this.mostraTutti.id).hasClass('active')) {
      selected_tags.push(this.mostraTutti.id);
    }
    for(var a=0; a<this.checks.length; a++) {
      if($('#'+this.checks[a].id).hasClass('active')) {
        selected_tags.push(this.checks[a].id);
      }
    }
    if(selected_tags.length == 0) {
      $('#'+this.mostraTutti.id).addClass('active');
      $('#'+this.mostraTutti.id).find('.fa').removeClass('fa-square-o');
      $('#'+this.mostraTutti.id).find('.fa').addClass('fa-check-square-o');
      selected_tags.push(this.mostraTutti.id);
    }
    var request = "?type="+this.type+"&n_tag="+selected_tags.length;
    for(var a=0; a<selected_tags.length; a++) {
      request += ("&tag_"+a+"="+selected_tags[a]);
    }
    $.when(getPagina('/shop/tools/getProductsFromTags.php'+request))
      .then(function (response) {
      var products = new Array();
      var tmp = JSON.parse(response);
      for(var a=0; a<tmp.length; a++) {
        var pr = new Product(tmp[a]);
        products.push(pr);
      }
      if(window.innerWidth > 576) {
        document.getElementById('card_deck-prodotti').style.width = 20 + 290 * products.length;
        document.getElementById('deck-container-panel').style.overflowX = 'auto';
      } else {
        document.getElementById('card_deck-prodotti').style.width = window.innerWidth;
        document.getElementById('deck-container-panel').style.overflowX = 'hidden';
      }
      var max = 0;
      for(var a=0; a<products.length; a++) {
        var tmp = products[a].printCard(a == 0);
        if(tmp > max) {
          max = tmp;
        }
      }
      if(products.length == 0) {
        document.getElementById('card_deck-prodotti').style.width = window.innerWidth;
        document.getElementById('card_deck-prodotti').innerHTML = '<h2 style="color: #888;">Nessun prodotto trovato</h2>';
      }
      $('.my-card').each(function () {
        this.style.minHeight = max;
      });
    });
  }
  
}

/*
class CheckTagManager {
  
  constructor() {
    this.checks = new Array();
  }
  
  addCheck(id, type, input_id) {
    var n = this.checks.length;
    this.checks[n] = document.getElementById(id);
    this.checks[n].data_type = type;
    this.checks[n].data_input = input_id;
    document.getElementById(input_id).onchange = function() {
      var check = check_tag_manager.checked(id);
      check_tag_manager.loadProductsFromTags();
      check_tag_manager.changeActive(check.id);
    };
  }
  
  checked(id) {
    var check = null;
    for(var a=0; a<this.checks.length; a++) {
      if(id == this.checks[a].id) {
        check = this.checks[a];
        break;
      }
    }
    this.changeActive(check.id);
    if(check.data_type == 1 && $('#'+check.id).hasClass('active')) {
      for(var a=0; a<this.checks.length; a++) {
        if(check.id != this.checks[a].id) {
          if($('#'+this.checks[a].id).hasClass('active')) {
            $('#'+this.checks[a].id).removeClass('active');
          }
        }
      }
    }
    return check;
  }
  
  changeActive(id) {
    if($('#'+id).hasClass('active')) {
      $('#'+id).removeClass('active');
    } else {
      $('#'+id).addClass('active');
    }
  }
  
  loadProductsFromTags() {
    var selected_tags = new Array();
    for(var a=0; a<this.checks.length; a++) {
      if($('#'+this.checks[a].id).hasClass('active')) {
        selected_tags.push($('#'+this.checks[a].id).attr("data-value"));
      }
    }
    var request = "?n_tag="+selected_tags.length;
    for(var a=0; a<selected_tags.length; a++) {
      request += ("&tag_"+a+"="+selected_tags[a]);
    }
    $.when(getPagina('/shop/tools/getProductsFromTags.php'+request))
      .then(function (response) {
      var products = new Array();
      var tmp = JSON.parse(response);
      for(var a=0; a<tmp.length; a++) {
        var pr = new Product(tmp[a]);
        products.push(pr);
      }
      if(window.innerWidth > 576) {
        document.getElementById('card_deck-prodotti').style.width = 20 + 290 * products.length;
        document.getElementById('deck-container-panel').style.overflowX = 'auto';
      } else {
        document.getElementById('card_deck-prodotti').style.width = window.innerWidth;
        document.getElementById('deck-container-panel').style.overflowX = 'hidden';
      }
      var max = 0;
      for(var a=0; a<products.length; a++) {
        var tmp = products[a].printCard(a == 0);
        if(tmp > max) {
          max = tmp;
        }
      }
      if(products.length == 0) {
        document.getElementById('card_deck-prodotti').style.width = window.innerWidth;
        document.getElementById('card_deck-prodotti').innerHTML = '<h2 style="color: #888;">Nessun prodotto trovato</h2>';
      }
      $('.my-card').each(function () {
        this.style.minHeight = max;
      });
    });
    
  }
  
}
*/
class Product {
  
  constructor(json) {
    this.id = json.id;
    this.nome = json.nome;
    this.image = json.image;
    this.short_descr = json.short_descr;
    this.alias = json.alias;
    this.site = json.site;
    this.type = json.school;
  }
  
  printCard(is_first) {
    var width = 260;
    if(window.innerWidth <= 576) {
      width = window.innerWidth - 90;
    }
    var is_edu = (this.type == 1);
    var card = '<div id="card_prod_'+this.id+'" class="card my-card" style="max-width: '+width+'px; min-width: '+width+'px; margin-top: 10px; margin-bottom: 10px;"><a href="'+(is_edu ? 'edu_shop/' : '')+'prodotti/'+this.alias+'"><img class="card-img-top" style="min-height: '+width+'; max-height: '+width+'" src="../../images/'+this.image+'"></a><div class="card-body" style="margin-bottom: 30px;"><h4 class="card-title">'+this.nome+'</h4><p class="card-text">'+this.short_descr+'</p><div id="card_button_'+this.id+'" class="row pr-3" style="position: absolute; bottom: 20px; width: 100%;"><div class="col-lg-12" style="text-align: center; padding-top: 15px;"><a href="'+(is_edu ? 'edu_shop/' : '')+'prodotti/'+this.alias+'" class="btn btn-outline-success fill-width">Vedi</a></div><div class="col-lg-12" style="text-align: center; padding-top: 15px;"><a href="'+this.site+'" target="_blanc" class="btn btn-outline-primary fill-width">Vai al Sito</a></div></div></div></div>';
    if(is_first) {
      document.getElementById('card_deck-prodotti').innerHTML = card;
    } else {
      document.getElementById('card_deck-prodotti').innerHTML += card;
    }
    var element = document.getElementById('card_prod_'+this.id);
    return element.clientHeight + document.getElementById('card_button_'+this.id).clientHeight - 40;
  }
  
}


















var slideIndex = 0;

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1} 
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none"; 
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block"; 
  dots[slideIndex-1].className += " active";
  clearTimeout(slides_timeout);
  slides_timeout = setTimeout(showSlidesAut, 10000); // Change image every 10 seconds
}

var slides_timeout = null;

function showSlidesAut() {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none"; 
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1} 
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  clearTimeout(slides_timeout);
  slides_timeout = setTimeout(showSlidesAut, 10000); // Change image every 10 seconds
}
