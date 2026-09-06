package com.mailapp.service;

import com.mailapp.dto.AiCommandRequest;
import com.mailapp.dto.AiCommandResponse;

public interface AiService {
    AiCommandResponse interpret(AiCommandRequest request);
}
