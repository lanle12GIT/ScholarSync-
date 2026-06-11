package com.nmcnpm.scholarslate.service;

import java.util.concurrent.CompletableFuture;

public interface ArxivSyncService {
    CompletableFuture<Void> syncPapers();
    void scoreMissingPapers();
}
