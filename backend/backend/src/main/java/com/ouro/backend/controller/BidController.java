package com.ouro.backend.controller;

import com.ouro.backend.entity.Bid;
import com.ouro.backend.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bid")
public class BidController {

    @Autowired
    private BidService bidService;

    @PostMapping("/place")
    public String placeBid(@RequestBody Bid bid) {
        return bidService.placeBid(bid);
    }
}