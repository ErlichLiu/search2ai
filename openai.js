// 在顶部定义CORS头部
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // 允许的HTTP方法
    'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization',
    'Access-Control-Max-Age': '86400', // 预检请求结果的缓存时间
};
addEventListener('fetch', event => {
    console.log(`收到请求: ${event.request.method} ${event.request.url}`);
    const url = new URL(event.request.url);
    // 处理 CORS 预检请求
    if (event.request.method === 'OPTIONS') {
        return event.respondWith(handleOptions());
    }
    const apiBase = typeof APIBASE !== 'undefined' ? APIBASE : 'https://api.openai.com';
    const authHeader = event.request.headers.get('Authorization'); // 从请求的 headers 中获取 Authorization
    let apiKey = '';
    if (authHeader) {
        apiKey = authHeader.split(' ')[1]; // 从 Authorization 中获取 API key
    } else {
        return event.respondWith(new Response('Authorization header is missing', {status: 400, headers: corsHeaders}));
    }
    if (url.pathname === '/v1/chat/completions') {
        console.log('接收到 fetch 事件');
        event.respondWith(handleRequest(event.request, apiBase, apiKey));
    } else {
        event.respondWith(handleOtherRequest(apiBase, apiKey, event.request, url.pathname).then(response => {
            return new Response(response.body, {
                status: response.status,
                headers: { ...response.headers, ...corsHeaders }
            });
        }));
    }
})
// 处理 OPTIONS 请求
function handleOptions() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

async function handleOtherRequest(apiBase, apiKey, request, pathname) {
    // 创建一个新的 Headers 对象，复制原始请求的所有头部，但不包括 Host 头部
    const headers = new Headers(request.headers);
    headers.delete('Host');
    headers.set('Authorization', `Bearer ${apiKey}`);

    // 对所有请求，直接转发
    const response = await fetch(`${apiBase}${pathname}`, {
        method: request.method,
        headers: headers,
        body: request.body
    });

    let data;
    if (pathname.startsWith('/v1/audio/')) {
        // 如果路径以 '/v1/audio/' 开头，处理音频文件
        data = await response.arrayBuffer();
        return new Response(data, {
            status: response.status,
            headers: { 'Content-Type': 'audio/mpeg', ...corsHeaders }
        });
    } else {
        // 对于其他路径，处理 JSON 数据
        data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: corsHeaders
        });
    }
}

// 搜索函数，调用您的搜索服务
async function search(query) {
    console.log(`正在使用查询进行自定义搜索: ${JSON.stringify(query)}`);
    try {
        const response = await fetch('https://search.search2ai.one', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": typeof SEARCH1API_KEY !== 'undefined' ? `Bearer ${SEARCH1API_KEY}` : '',
                "google_cx": typeof GOOGLE_CX !== 'undefined' ? GOOGLE_CX : '',
                "google_key": typeof GOOGLE_KEY !== 'undefined' ? GOOGLE_KEY : '',
                "serpapi_key": typeof SERPAPI_KEY !== 'undefined' ? SERPAPI_KEY : '',
                "serper_key": typeof SERPER_KEY !== 'undefined' ? SERPER_KEY : '',
                "bing_key": typeof BING_KEY !== 'undefined' ? BING_KEY : '',
                "apibase": typeof APIBASE !== 'undefined' ? APIBASE : 'https://api.openai.com'
            },
            body: JSON.stringify({
                query: query,
                search_service: SEARCH_SERVICE,
                max_results: 5
            })
        });

        if (!response.ok) {
            console.error(`API 请求失败, 状态码: ${response.status}`);
            return `API 请求失败, 状态码: ${response.status}`;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("收到的响应不是有效的 JSON 格式");
            return "收到的响应不是有效的 JSON 格式";
        }

        const data = await response.json();
        console.log('自定义搜索服务调用完成');
        return JSON.stringify(data); 
        }catch (error) {
                console.error(`在 search 函数中捕获到错误: ${error}`);
                return `在 search 函数中捕获到错误: ${error}`;
            }
}
// 新闻搜索函数，调用您的新闻搜索服务
async function news(query) {
    console.log(`正在使用查询进行新闻搜索: ${JSON.stringify(query)}`);
    try {
        const response = await fetch('https://ddg.search2ai.online/searchNews', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
                },
            body: JSON.stringify({
                q: query,
                max_results: 10
            })
        });

        if (!response.ok) {
            console.error(`API 请求失败, 状态码: ${response.status}`);
            return `API 请求失败, 状态码: ${response.status}`;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("收到的响应不是有效的 JSON 格式");
            return "收到的响应不是有效的 JSON 格式";
        }

        const data = await response.json();
        console.log('新闻搜索服务调用完成');
        return JSON.stringify(data); 
    } catch (error) {
        console.error(`在 news 函数中捕获到错误: ${error}`);
        return `在 news 函数中捕获到错误: ${error}`;
    }
}
// 爬取函数，调用你的爬取服务
async function crawer(url) {
    console.log(`正在使用 URL 进行自定义爬取:${JSON.stringify(url)}`);
    try {
        const response = await fetch('https://crawer.search2ai.one', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: url
            })
        });

        if (!response.ok) {
            console.error(`API 请求失败, 状态码: ${response.status}`);
            return `API 请求失败, 状态码: ${response.status}`;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("收到的响应不是有效的 JSON 格式");
            return "收到的响应不是有效的 JSON 格式";
        }

        const data = await response.json();
        console.log('自定义爬取服务调用完成');
        return JSON.stringify(data); 
    } catch (error) {
        console.error(`在 crawl 函数中捕获到错误: ${error}`);
        return `在 crawer 函数中捕获到错误: ${error}`;
    }
}
async function handleRequest(request, apiBase, apiKey) {
    console.log(`开始处理请求: ${request.method} ${request.url}`);

    // 确保请求是我们可以处理的类型
    if (request.method !== 'POST') {
        console.log(`不支持的请求方法: ${request.method}`);
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }
    
    const requestData = await request.json();
    console.log('请求数据:', requestData);
    const stream = requestData.stream || false;
    const userMessages = requestData.messages.filter(message => message.role === 'user');
    const latestUserMessage = userMessages[userMessages.length - 1];
    const model = requestData.model
    const isContentArray = Array.isArray(latestUserMessage.content);
    const defaultMaxTokens = 3000;
    const maxTokens = requestData.max_tokens || defaultMaxTokens; // 使用默认 max_tokens 如果未提供

    const body = JSON.stringify({
        model: model,
        messages: requestData.messages, 
        max_tokens: maxTokens, 
        ...(isContentArray ? {} : {
            tools: [
                {
                    type: "function",
                    function: {
                        name: "search",
                        description: "search for factors",
                        parameters: {
                            type: "object",
                            properties: {
                                query: { type: "string","description": "The query to search."}
                            },
                            required: ["query"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "news",
                        description: "Search for news",
                        parameters: {
                            type: "object",
                            properties: {
                                query: { type: "string", description: "The query to search for news." }
                            },
                            required: ["query"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "crawer",
                        description: "Get the content of a specified url",
                        parameters: {
                            type: "object",
                            properties: {
                                url: {
                                    type: "string",
                                    description: "The URL of the webpage"},
                            },
                            required: ["url"],
                        }
                    }
                }
            ],
            tool_choice: "auto"
        })
    });
    console.log('请求体:', body);
    const openAIResponse = await fetch(`${apiBase}/v1/chat/completions`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // 使用从请求的 headers 中获取的 API key
        },
        body: body
    });
    const data = await openAIResponse.json();
    console.log('OpenAI API 响应状态码:', openAIResponse.status);
    if (!data.choices || data.choices.length === 0) {
        console.log('数据中没有选择项');
        return new Response('数据中没有选择项', { status: 500 });
    }
    
    console.log('OpenAI API 响应接收完成，检查是否需要调用自定义函数');
    let messages = requestData.messages;
    messages.push(data.choices[0].message);
    // 检查是否有函数调用
    let calledCustomFunction = false;
    if (data.choices[0].message.tool_calls) {
        const toolCalls = data.choices[0].message.tool_calls;
        const availableFunctions = {
            "search": search,
            "news": news,
            "crawer": crawer        
        };
        for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            const functionToCall = availableFunctions[functionName];
            const functionArgs = JSON.parse(toolCall.function.arguments);
            let functionResponse;
            if (functionName === 'search') {
                functionResponse = await functionToCall(functionArgs.query);
            } else if (functionName === 'crawer') {
                functionResponse = await functionToCall(functionArgs.url);
            } else if (functionName === 'news') {
                functionResponse = await functionToCall(functionArgs.query);
            }
            console.log('工具调用的响应: ', functionResponse);
            messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: functionName,
                content: functionResponse, 
 
            });
            if (functionName === "search" || functionName === "crawer"|| functionName === "news") {
                calledCustomFunction = true;
            }
        }
        console.log('准备发送第二次 OpenAI API 请求');
        const requestBody = {
            model: model,
            messages: messages,
            stream: stream
        };
        const secondResponse = await fetch(`${apiBase}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}` // 使用从请求的 headers 中获取的 API key
            },
            body: JSON.stringify(requestBody)
        });
        console.log('响应状态码: 200');
        if (stream) {
    // 使用 SSE 格式
    return new Response(secondResponse.body, {
        status: secondResponse.status,
        headers: { 
            'Content-Type': 'text/event-stream',
            ...corsHeaders, 
        }
    });
} else {
    // 使用普通 JSON 格式
    const data = await secondResponse.json();
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders, 
        }
    }); 
} }
    if (!calledCustomFunction) {
    // 没有调用自定义函数，直接返回原始回复
    console.log('响应状态码: 200');
    // 创建一个将 JSON 数据转换为 SSE 格式的流的函数
    function jsonToStream(jsonData) {
        const encoder = new TextEncoder();
        const delay = 10; // 延迟0.01秒

        return new ReadableStream({
            start(controller) {
                const characters = Array.from(jsonData.choices[0].message.content);
                let i = 0;

                function pushCharacter() {
                    if (i >= characters.length) {
                        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                        controller.close();
                    } else {
                        const character = characters[i];
                        const newJsonData = {
                            id: jsonData.id,
                            object: 'chat.completion.chunk',
                            created: jsonData.created,
                            model: jsonData.model,
                            choices: [
                                {
                                    index: 0,
                                    delta: {
                                        content: character
                                    },
                                    logprobs: null,
                                    finish_reason: i === characters.length - 1 ? 'stop' : null
                                }
                            ],
                            system_fingerprint: jsonData.system_fingerprint
                        };

                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(newJsonData)}\n\n`));
                        i++;
                        setTimeout(pushCharacter, delay);
                    }
                }

                pushCharacter();
            }
        });
    }

    
    if (stream) {
        // 使用 SSE 格式
        const sseStream = jsonToStream(data);
        return new Response(sseStream,{
            status: 200,
            headers: { 
                'Content-Type': 'text/event-stream',
                ...corsHeaders, 
            }
        });
    } else {
        // 使用普通 JSON 格式
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders, 
            }
        }); 
    }
}
}
