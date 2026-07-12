/**
 * モック基幹システム (Zendesk / CRM / ERP)
 *
 * 本番ではそれぞれ実APIのクライアントに差し替える。
 * インターフェースを「ツールから呼ばれる構造化API」として設計しているため、
 * 差し替えてもエージェント側のロジックは変わらない。
 */

import type { Member, Order, Refund, Ticket, TicketStatus } from './types';

// ============================================================
// Mock Zendesk
// ============================================================

export class MockZendesk {
  private tickets = new Map<number, Ticket>();
  private nextId = 1001;

  createTicket(subject: string, comment: string, requesterEmail: string): Ticket {
    const ticket: Ticket = {
      id: this.nextId++,
      subject,
      comment,
      requesterEmail,
      status: 'new',
      tags: [],
      internalNotes: [],
      replies: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  getTicket(id: number): Ticket | undefined {
    return this.tickets.get(id);
  }

  addInternalNote(id: number, note: string): void {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`チケット ${id} が存在しません`);
    ticket.internalNotes.push(note);
    ticket.updatedAt = Date.now();
  }

  addReply(id: number, reply: string): void {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`チケット ${id} が存在しません`);
    ticket.replies.push(reply);
    ticket.updatedAt = Date.now();
  }

  setStatus(id: number, status: TicketStatus): void {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`チケット ${id} が存在しません`);
    ticket.status = status;
    ticket.updatedAt = Date.now();
  }

  addTags(id: number, tags: string[]): void {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`チケット ${id} が存在しません`);
    ticket.tags = [...new Set([...ticket.tags, ...tags])];
    ticket.updatedAt = Date.now();
  }

  all(): Ticket[] {
    return [...this.tickets.values()].sort((a, b) => b.createdAt - a.createdAt);
  }
}

// ============================================================
// Mock CRM (会員DB)
// ============================================================

export class MockCRM {
  private members = new Map<string, Member>();

  constructor() {
    const seed: Member[] = [
      {
        memberId: 'M-1001',
        name: '田中 太郎',
        email: 'tanaka@example.com',
        address: '東京都渋谷区神南1-2-3 レジデンス渋谷401',
        updatedAt: Date.now(),
      },
      {
        memberId: 'M-1002',
        name: '鈴木 花子',
        email: 'suzuki@example.com',
        address: '神奈川県横浜市西区みなとみらい4-5-6',
        updatedAt: Date.now(),
      },
    ];
    for (const m of seed) this.members.set(m.memberId, m);
  }

  lookupMember(memberId: string): Member | undefined {
    return this.members.get(memberId);
  }

  updateAddress(memberId: string, newAddress: string): Member {
    const member = this.members.get(memberId);
    if (!member) throw new Error(`会員 ${memberId} が存在しません`);
    member.address = newAddress;
    member.updatedAt = Date.now();
    return member;
  }

  all(): Member[] {
    return [...this.members.values()];
  }
}

// ============================================================
// Mock ERP (受注・返金)
// ============================================================

export class MockERP {
  private orders = new Map<string, Order>();
  private refunds = new Map<string, Refund>();
  private refundSeq = 0;

  constructor() {
    const seed: Order[] = [
      {
        orderId: 'O-5001',
        memberId: 'M-1001',
        item: 'ワイヤレスイヤホン',
        amountJpy: 3000,
        status: 'shipped',
      },
      {
        orderId: 'O-5002',
        memberId: 'M-1001',
        item: 'ノイズキャンセリングヘッドホン',
        amountJpy: 25000,
        status: 'delivered',
      },
      {
        orderId: 'O-5003',
        memberId: 'M-1002',
        item: 'スマートウォッチ',
        amountJpy: 18000,
        status: 'processing',
      },
    ];
    for (const o of seed) this.orders.set(o.orderId, o);
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  createRefund(orderId: string, amountJpy: number, reason: string): Refund {
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`注文 ${orderId} が存在しません`);
    if (amountJpy > order.amountJpy) {
      throw new Error(`返金額 ¥${amountJpy} が注文金額 ¥${order.amountJpy} を超えています`);
    }
    const refund: Refund = {
      refundId: `R-${++this.refundSeq}`,
      orderId,
      amountJpy,
      reason,
      createdAt: Date.now(),
    };
    this.refunds.set(refund.refundId, refund);
    return refund;
  }

  getRefund(refundId: string): Refund | undefined {
    return this.refunds.get(refundId);
  }

  allOrders(): Order[] {
    return [...this.orders.values()];
  }

  allRefunds(): Refund[] {
    return [...this.refunds.values()].sort((a, b) => b.createdAt - a.createdAt);
  }
}
