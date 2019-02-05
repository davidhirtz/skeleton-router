var Router=(function()
{
	return function(o)
	{
		var _=this;

		_.$container=$('main');
		_.$body=$('body');

		_.headers={'X-Ajax-Request':'route'};
		_.defaultRoute='home';

		_.params=_.onUnload=_.deconstruct=_.referrer=_.trackingId=null;
		_.routes={};
		_.trackingConfig={};

		_.loadingClass='loading';
		_.noXhrClass='no-xhr';
		_.noCacheClass='no-cache';

		_.cookieName='_cc';
		_.$cookieContainer=$('#cc');
		_.$cookieAccept=$('.cc-accept');

		$.extend(_, o);

		_.cache={};
		_.positions={};

		_.analyticsLoaded=false;

		_.init();
		_.loadAnalytics(_.trackingId);
		_.cookieConsent();

		_.render();
	};
}());

/**
 * Inits ajax routing events.
 */
Router.prototype.init=function()
{
	var _=this,
		origin=/^.+?\/\/+[^/]+/,
		win=window,
		doc=document,
		hist=history,
		loc=hist.location || win.location;

	$(win).on('popstate', function(e)
	{
		_.load(false);
		e.preventDefault();
	});

	$(doc).on('click', 'a', function(e)
	{
		var t=this;

		_.onClick(e);

		if(e.isDefaultPrevented() || e.ctrlKey || e.metaKey || e.shiftKey || !t.hasAttribute('href') || t.hasAttribute('download') || t.classList.contains(_.noXhrClass) || t.target && t.target!=='_self' || t.href.indexOf(loc.href.match(origin)[0])=== -1)
		{
			return;
		}

		if(t.href!==loc.href)
		{
			hist.pushState(null, t.title || doc.title, _.sanitizeUrl(t.href));
			_.load(true, t.classList.contains(_.noCacheClass) ? {cache:false} : null);
		}

		e.preventDefault();
	});

	_.afterInit();
};

/**
 * Global link click event.
 */
Router.prototype.onClick=function()
{
};

/**
 * Triggers after init before first render.
 */
Router.prototype.afterInit=function()
{
};

/**
 * Loads page via ajax or from cache.
 */
Router.prototype.load=function(reset, options)
{
	var _=this,
		path=window.location.pathname,
		request=null;

	_.positions[_.referrer]={x:window.pageXOffset, y:window.pageYOffset};
	_.beforeLoad(reset);

	if(!_.cache[path] || options)
	{
		request=$.ajax($.extend({url:path, headers:_.headers}, options || {})).done(function(body)
			{
				_.cache[path]=body;
			})
			.fail(function(jqxhr)
			{
				var redirect=jqxhr.getResponseHeader('X-Redirect');

				if(redirect)
				{
					window.location.href=redirect;
				}
			});
	}

	// Wait till deconstruct (if needed) and request are done.
	//noinspection JSUnresolvedFunction
	$.when.apply($, [_.deconstruct, request].filter(function(v)
		{
			return v;
		}))
		.done(function()
		{
			_.afterLoad(_.cache[path], reset);
			_.render();
			_.updateAnalytics(path);

			if(!reset && _.positions[path])
			{
				window.scrollTo(_.positions[path].x, _.positions[path].y);
			}
		});
};

/**
 * Triggers before ajax load.
 */
Router.prototype.beforeLoad=function()
{
	var _=this;
	_.$body.addClass(_.loadingClass).trigger('unload');

	if(_.onUnload)
	{
		// If unload is set, it must call _.deconstruct.resolve().
		_.deconstruct=$.Deferred();
		_.onUnload();
	}
};

/**
 * Renders content after ajax load.
 */
Router.prototype.afterLoad=function(html)
{
	var _=this;

	window.scrollTo(0, 0);

	_.deconstruct=null;
	_.$body.removeClass(_.loadingClass);

	_.$container.html(html);
};

/**
 * Renders all page.
 */
Router.prototype.render=function()
{
	var _=this,
		path=window.location.pathname,
		func;

	_.params=path.replace(/^\//, '').split(/[/?#]/);

	func=(_.params[0] || _.defaultRoute);
	func='render'+func[0].toUpperCase()+func.slice(1);

	if(typeof _[func]==='function')
	{
		_[func]();
	}

	_.afterRender();
	_.referrer=path;
};

/**
 * Triggers after render.
 */
Router.prototype.afterRender=function()
{
};

Router.prototype.loadAnalytics=function(id)
{
	// Disable for Google Page Speed Insights.
	if(id && navigator.userAgent.indexOf('Speed Insights')=== -1)
	{
		var _=this;

		$.getScript('https://www.googletagmanager.com/gtag/js?id='+id, function()
		{
			window.dataLayer=window.dataLayer || [];

			dataLayer.push(['js', new Date()]);
			dataLayer.push(['config', id, _.trackingConfig]);

			_.trackingId=id;
			_.analyticsLoaded=true;
		});
	}
};

// noinspection JSUnusedGlobalSymbols
Router.prototype.updateAnalytics=function(path)
{
	var _=this;

	if(_.analyticsLoaded)
	{
		window.dataLayer.push({event:'pageview', url:path});
	}
};

/**
 * Replaces cached route with AJAX post request.
 */
Router.prototype.post=function(url, data)
{
	var _=this;

	history.pushState(null, document.title, _.sanitizeUrl(url));
	_.load(true, {method:'post', data:data});
};

/**
 * Scrolls to target.
 */
Router.prototype.scrollTo=function(target, offset, speed)
{
	var $target=$(target);

	if($target.length)
	{
		// noinspection JSCheckFunctionSignatures
		$('html,body').animate({scrollTop:$target.offset().top+(offset || 0)}, speed || 300);
	}
};

/**
 * Inits cookie consent.
 */
Router.prototype.cookieConsent=function()
{
	var _=this;

	if(_.$cookieContainer && _.$cookieContainer.length)
	{
		if(!_.checkConsentCookie())
		{
			_.$cookieAccept.one('click', function()
			{
				_.$cookieContainer.slideDown('fast', function()
				{
					_.$cookieContainer.removeClass('active');
				});

				_.setConsentCookie();
			});

			_.$cookieContainer.addClass('active');
		}
	}
};

/**
 * Checks cookie consent cookie.
 */
Router.prototype.checkConsentCookie=function()
{
	var _=this,
		cookies=document.cookie ? document.cookie.split('; ') : [],
		i=0;

	for(; i<cookies.length; i++)
	{
		if(cookies[i].split('=')[0]===_.cookieName)
		{
			return true;
		}
	}

	return false;
};

/**
 * Set cookie.
 */
Router.prototype.setConsentCookie=function()
{
	var _=this,
		date=new Date();

	date.setFullYear(date.getFullYear()+1);
	document.cookie=_.cookieName+"=1; expires="+date.toUTCString()+"; path=/";
};

/**
 * Sanitizes url.
 */
Router.prototype.sanitizeUrl=function(url)
{
	return url.replace(/\/$/, '');
};
