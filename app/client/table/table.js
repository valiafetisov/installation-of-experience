Template.table.onRendered(() => {
  Meteor.setTimeout(() => {
    $('.table').css({
      'padding-top': Meteor.settings.public.view.padding.top,
      'padding-bottom': Meteor.settings.public.view.padding.bottom,
      'padding-left': Meteor.settings.public.view.padding.left,
      'padding-right': Meteor.settings.public.view.padding.right,
      'font-size': Meteor.settings.public.view.size
    });
    $('.row').css('width', (index) => {
      return ((100 - 1) / Meteor.settings.public.view.cols) + '%';
    });
  }, 1000);
});

Template.table.helpers({
  recordingsChunks() {
    const array = Records.find({}, { sort: { from: 1 } }).fetch();
    if (!array) return;
    if (!Meteor.settings.public.view.rows) return;
    const ret = [];
    const chunk = Meteor.settings.public.view.rows;
    let i = 0;
    const j = array.length;
    while (i < j) {
      ret.push(array.slice(i, i + chunk));
      i += chunk;
    }
    // console.log('recordingsChunks', ret, array, i, j);
    return ret;
  },

  getPeriod(date) {
    // return date.from
    const space = "<span style='visibility:hidden;'>:00</span>";
    if (!date || !date.from) return "&nbsp;";
    const from = space + moment(date.from).format('HH:mm');
    if (!date.to) return from + ' – ' + moment(Session.get("reactiveTime")).format('HH:mm:ss');
    const to = moment(date.to).format('HH:mm') + space;
    return from + ' – ' + to;
  }
});

Session.setDefault("reactiveTime", new Date());
Meteor.setInterval(() => {
  Session.set("reactiveTime", new Date());
}, 500);
