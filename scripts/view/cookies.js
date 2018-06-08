/**
 * Cookies View
 * Created by Yuiitsu on 2018/06/06.
 */
View.extend('cookies', function() {

    this.cookies_manager = function() {
        return `
            <table class="cookies-table">
                <thead>
                    <tr>
                        <th>Domain</th>
                        <th>Name</th>
                        <th>Value</th>
                        <th></th>
                    </tr>
                </thead>       
                <tbody>
                    {{ for var i in data['list'] }}
                    <tr>
                        <td>{{ data['list'][i]['domain'] }}</td>              
                        <td>{{ data['list'][i]['name'] }}</td>              
                        <td>{{ data['list'][i]['value'] }}</td>              
                        <td class="cookies-del js-handler" data-host="{{ data['host'] }}" data-name="{{ data['list'][i]['name'] }}"><i class="mdi mdi-delete" /></td>              
                    </tr>           
                    {{ end }}
                </tbody>
            </table>
        `;
    };
});

