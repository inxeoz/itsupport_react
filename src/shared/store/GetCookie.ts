import * as https from 'https';
import * as fs from 'fs';

interface RequestOptions {
    method: string;
    hostname: string;
    path: string;
    headers: {
        Accept: string;
        'Content-Type': string;
        Cookie?: string;
    };
}

interface LoginData {
    usr: string;
    pwd: string;
}

const loginOptions: RequestOptions = {
    method: 'POST',
    hostname: 'itsupport.inxeoz.com',
    path: '/api/method/login',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};

// Function to make the second API call with cookies
function makeSecondRequest(cookies: string[]) {
    const cookieString = cookies.join('; ');

    const secondOptions: RequestOptions = {
        method: 'GET', // or POST, depending on your API
        'hostname': 'itsupport.inxeoz.com',
        'path': '/api/resource/Ticket',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cookie': cookieString
        }
    };

    console.log('\n--- Making Second Request ---');
    console.log('Using Cookies:', cookieString);

    const secondReq = https.request(secondOptions, (res) => {
        console.log('Second Request Response Headers:', res.headers);

        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });

        res.on('end', () => {
            const body: Buffer = Buffer.concat(chunks);
            console.log('Second Request Response Body:', body.toString());
        });

        res.on('error', (error: Error) => {
            console.error('Second Request Error:', error);
        });
    });

    secondReq.on('error', (error: Error) => {
        console.error('Second Request Error:', error);
    });

    secondReq.end();
}

// First request to login
console.log('--- Making Login Request ---');
const req = https.request(loginOptions, (res) => {
    // Print all headers
    console.log('Login Response Headers:', res.headers);

    // Print set-cookie header specifically
    const setCookieHeader = res.headers['set-cookie'];
    if (setCookieHeader) {
        console.log('Set-Cookie Header:');
        setCookieHeader.forEach((cookie, index) => {
            console.log(`  Cookie ${index + 1}: ${cookie}`);
        });

        // Make the second request with cookies
        makeSecondRequest(setCookieHeader);
    } else {
        console.log('No set-cookie header found');
    }

    const chunks: Buffer[] = [];

    res.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
    });

    res.on('end', () => {
        const body: Buffer = Buffer.concat(chunks);
        console.log('Login Response Body:', body.toString());
    });

    res.on('error', (error: Error) => {
        console.error('Login Error:', error);
    });
});

req.on('error', (error: Error) => {
    console.error('Login Request Error:', error);
});

const postData: LoginData = {
    usr: 'Administrator',
    pwd: '1212'
};

req.write(JSON.stringify(postData));
req.end();
