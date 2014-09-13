// Generated by CoffeeScript 1.7.1
var Event, User, americano, momentTz, time;

americano = require('americano-cozy');

time = require('time');

momentTz = require('moment-timezone');

User = require('./user');

module.exports = Event = americano.getModel('Event', {
  start: {
    type: String
  },
  end: {
    type: String
  },
  place: {
    type: String
  },
  details: {
    type: String
  },
  description: {
    type: String
  },
  diff: {
    type: Number
  },
  rrule: {
    type: String
  },
  tags: {
    type: function(x) {
      return x;
    }
  },
  attendees: {
    type: [Object]
  },
  related: {
    type: String,
    "default": null
  }
});

require('cozy-ical').decorateEvent(Event);

Event.all = function(params, callback) {
  return Event.request("all", params, callback);
};

Event.tags = function(callback) {
  return Event.rawRequest("tags", {
    group: true
  }, function(err, results) {
    var out, result, tag, type, _i, _len, _ref;
    if (err) {
      return callback(err);
    }
    out = {
      calendar: [],
      tag: []
    };
    for (_i = 0, _len = results.length; _i < _len; _i++) {
      result = results[_i];
      _ref = result.key, type = _ref[0], tag = _ref[1];
      out[type].push(tag);
    }
    return callback(null, out);
  });
};

Event.prototype.getCouchStartDate = function() {
  if (this.timezone == null) {
    this.timezone = User.timezone;
  }
  return momentTz(this.start).tz(this.timezone).tz('UTC').format('YYYY-MM-DDThh:mm:ss.000') + 'Z';
};

Event.prototype.timezoned = function(timezone) {
  var timezonedDate;
  if (timezone == null) {
    timezone = User.timezone;
  }
  timezonedDate = new time.Date(this.start, 'UTC');
  timezonedDate.setTimezone(timezone);
  this.start = timezonedDate.toString().slice(0, 24);
  timezonedDate = new time.Date(this.end, 'UTC');
  timezonedDate.setTimezone(timezone);
  this.end = timezonedDate.toString().slice(0, 24);
  return this;
};

Event.prototype.getGuest = function(key) {
  var currentguest, guests, _ref;
  guests = ((_ref = this.attendees) != null ? _ref.toJSON() : void 0) || [];
  currentguest = guests.filter(function(guest) {
    return guest.key === key;
  })[0];
  if (currentguest) {
    currentguest.setStatus = (function(_this) {
      return function(status, callback) {
        currentguest.status = status;
        return _this.updateAttributes({
          attendees: guests
        }, callback);
      };
    })(this);
  }
  return currentguest;
};

Event.toUTC = function(attrs) {
  var end, start, timezone;
  timezone = attrs.timezone || User.timezone;
  start = new time.Date(attrs.start, timezone);
  start.setTimezone('UTC');
  attrs.start = start.toString().slice(0, 24);
  end = new time.Date(attrs.end, timezone);
  end.setTimezone('UTC');
  attrs.end = end.toString().slice(0, 24);
  return attrs;

  /* Constraints an alarm of alarms
      * All types
          action{1} : in [AUDIO, DISPLAY, EMAIL, PROCEDURE]
          trigger{1} : when the alarm is triggered
  
  
      * Display
          description{1} : text to display when alarm is triggered
          (
              duration
              repeat
          )?
  
      * Email
          summary{1} : email title
          description{1} : email content
          attendee+ : email addresses the message should be sent to
          attach* : message attachments
  
      * Audio
          (
              duration
              repeat
          )?
  
          attach? : sound resource (base-64 encoded binary or URL)
  
      * Proc
          attach{1} : procedure resource to be invoked
          (
              duration
              repeat
          )?
          description?
   */
};
