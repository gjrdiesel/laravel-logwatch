String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

Vue.component('logstable',{
    template: `<div>
    <table class="table table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Log</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
        <tr v-for="log in logs" @click="viewLog(log)">
          <th scope="row">{{ $index+1 }}</th>
          <td>{{ log.type }}</td>
          <td>{{ log.title }}</td>
          <td>{{ log.date }}</td>
        </tr>
        </tbody>
      </table>
    </div>`,
    ready(){
        this.$http.get('/logs').then((response)=>{
            this.rawLogs = JSON.parse(response.data);
        })
    },
    watch: {
        rawLogs(){
            this.rawLogs.forEach((log,key)=>{

                var error  = log.content.split(' in /')[0];

                var date   = error.split(']')[0].split('[')[1];

                var type = error.split(': ')[0].split(']')[1];

                var message= error.split(': ').slice(1).join(' ');

                var apiSafe= message.replaceAll('[','');
                apiSafe= apiSafe.replaceAll(']','');
                apiSafe= apiSafe.replaceAll("'",'');

                this.logs.push({
                    type: type,
                    content: log.content,
                    date: date,
                    title: message,
                    api_safe: apiSafe
                })

            })
        }
    },
    methods:{
        viewLog(log){
            this.store.view = 'logview';
            this.store.log = log;
        },
    },
    data(){
        return {
            logs: [],
            rawLogs: [],
            store
        }
    }
})

Vue.component('stackoverflow',{
    //https://api.stackexchange.com/2.2/similar?order=desc&sort=relevance&tagged=laravel&title=[msg_here]&site=stackoverflow
    //http://stackoverflow.com/a/28421878
    template: `<div v-bind:class="{ floatbtn: !results.items }">
        <button v-show="!results.items" @click="search()" class="btn btn-primary">Search StackOverflow</button>
        <div v-show="results.items">
        <div class="list-group">
            <a href="{{ getAnswerLink(question) }}" target="_blank" class="list-group-item list-group-item-action" v-for="question in results.items">
                <h5 class="list-group-item-heading">{{{ question.title }}}</h5>
                <p class="list-group-item-text">Answered: {{ question.is_answered ? 'yes' : 'no' }} / Answers: {{ question.answer_count }} / Views: {{ question.view_count }}</p>
            </a>
        </div>
        </div>
    </div>`,
    props: ['query'],
    methods:{
        getAnswerLink(question){
            if( question.accepted_answer_id ){
                return 'http://stackoverflow.com/a/'+question.accepted_answer_id;
            } else {
                return question.link;
            }
        },
        search(){
            var url = 'https://api.stackexchange.com/2.2/similar?order=desc&sort=relevance&tagged=laravel&title='+this.query+'&site=stackoverflow';
            this.$http.get(url).then((response)=>{
                this.results = response.data;
            })
        }
    },
    data(){
        return {
            results: []
        }
    }
})

Vue.component('logview',{
    template: `<div><pre v-bind:class="{ 'is-fullscreen': fullscreen }">{{ store.log.content }}</pre>
            <button class="btn btn-default" @click="fullscreen=!fullscreen">
                <span v-if="!fullscreen">View entire log</span><span v-else>Condense log<span>
            </button>
            &nbsp;<a href="">back to rest of the logs</a>
            <stackoverflow :query="store.log.api_safe"></stackoverflow>
        </div>`,
    ready(){
    },
    data(){
        return {
            fullscreen: false,
            store
        }
    }
})

Vue.component('appview',{
    template: `<div>
        <component :is="store.view"></component>
    </div>`,
    data(){
        return {
            store
        }
    }

})

var store = {
    view: 'logstable'
};

var vue = new Vue({
    el: '#app',
    methods: {
        viewLogs(){
            this.store.view = 'logstable';
        },
        clearLogs(){
            if( confirm("Are you sure you want to clear all the logs?") ){
                this.$http.get('/clear');
            }
        }
    },
    data: {
        store
    }
});
