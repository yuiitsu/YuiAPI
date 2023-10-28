chrome.action.onClicked.addListener(function (tab) {
    chrome.tabs.create({url: 'index.html'});
});

// async function testFetch() {
//     const res = await fetch('https://www.bangbangyo.com', {
//         mode: 'cors',
//         headers: {
//             'Cookies': '1=2'
//         }
//     });
// }

fetch('https://www.bangbangyo.com', {
        mode: 'cors',
        headers: {
            'Cookie': '1=2'
        },
        credentials: 'include'
    });

// testFetch();