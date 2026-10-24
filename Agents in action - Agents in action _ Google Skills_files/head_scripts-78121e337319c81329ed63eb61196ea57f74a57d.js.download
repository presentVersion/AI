function dataLayerInit(existsUser, inFreeTrial, inGwgFreeTrial, hasSubscription, customerName) {
  let loginStatus = 'logged out';
  if(existsUser){
    loginStatus = 'logged in';
  }
  let subscriptionStatus = 'not subscribed';
  if(inFreeTrial || inGwgFreeTrial){
    subscriptionStatus = 'trial';
  } else if (hasSubscription){
    subscriptionStatus = 'subscribed';
  }
  dataLayer.push({
    'loginStatus': loginStatus,
    'partnerSite': customerName,
    'subscriptionStatus': subscriptionStatus
  });
}

function pushSessionEvent(eventName, loginStatus, previousPagePath) {
  const eventData = {
    'event': eventName,
    ...(loginStatus && {loginStatus}),
    ...(previousPagePath && {previousPagePath}),
  }
  dataLayer.push(eventData);
}

function pushPageEvent() {
  let previousPage = null;
  if(document.referrer){
    previousPage = new URL(document.referrer).pathname;
  }
  dataLayer.push({
    'event': 'page_view',
    'pagePath': window.location.pathname,
    'previousPagePath': previousPage
  });
}
