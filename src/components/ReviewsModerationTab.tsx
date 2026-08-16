import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquare, ThumbsUp, ShieldCheck, XCircle, Check, CornerDownRight } from 'lucide-react';
import { Review } from '../types';

interface ReviewsModerationTabProps {
  reviews?: Review[];
  onUpdateData: (updater: (prev: any) => any) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const ReviewsModerationTab: React.FC<ReviewsModerationTabProps> = ({
  reviews = [],
  onUpdateData,
  theme = 'light',
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleUpdateStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      await fetch(`/api/v1/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await onUpdateData((prev: any) => ({
        ...prev,
        reviews: (prev.reviews || []).map((r: any) => (r.id === reviewId ? { ...r, status } : r)),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    await onUpdateData((prev: any) => ({
      ...prev,
      reviews: (prev.reviews || []).map((r: any) =>
        r.id === reviewId
          ? {
              ...r,
              merchant_reply: {
                reply_text: replyText.trim(),
                replied_at: new Date().toISOString().split('T')[0],
              },
            }
          : r
      ),
    }));

    setReplyingReviewId(null);
    setReplyText('');
  };

  const filteredReviews = reviews.filter((r) => (filter === 'all' ? true : r.status === filter));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
              <Star className="w-6 h-6 fill-current" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Customer Reviews & Ratings</h2>
              <p className="text-xs text-zinc-500">
                Moderate feedback, approve testimonials, and respond directly to customer reviews.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                  filter === st
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-xs text-zinc-500">
            No reviews found matching "{filter}".
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-200">
                    {review.customer_name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      {review.customer_name}
                      {review.is_verified_purchase && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Product: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{review.product_name || 'Store Review'}</span> &bull; {review.created_at}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= review.rating ? 'fill-current' : 'text-zinc-200 dark:text-zinc-700'}`}
                      />
                    ))}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      review.status === 'approved'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : review.status === 'pending'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {review.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Review Body */}
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl">
                {review.comment}
              </p>

              {/* Merchant Reply if exists */}
              {review.merchant_reply && (
                <div className="ml-4 pl-4 border-l-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-r-xl text-xs space-y-1">
                  <p className="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5" /> Merchant Response ({review.merchant_reply.replied_at})
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">{review.merchant_reply.reply_text}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(review.id, 'approved')}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(review.id, 'rejected')}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                </div>

                {!review.merchant_reply && (
                  <button
                    onClick={() => {
                      setReplyingReviewId(replyingReviewId === review.id ? null : review.id);
                      setReplyText('');
                    }}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Reply to Customer
                  </button>
                )}
              </div>

              {/* Reply Form */}
              {replyingReviewId === review.id && (
                <div className="pt-2 space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Write a warm, professional reply from the merchant..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full text-xs p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyingReviewId(null)}
                      className="px-3 py-1 text-xs text-zinc-500 hover:bg-zinc-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveReply(review.id)}
                      className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                    >
                      Publish Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
